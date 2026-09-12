package com.whatsapp.ai.agent.application;

import com.whatsapp.ai.agent.domain.AiAgentService;
import com.whatsapp.ai.agent.infrastructure.messaging.AgentMessageProducer;
import com.whatsapp.ai.agent.infrastructure.rest.ConfigManagerClient;
import com.whatsapp.ai.agent.infrastructure.rest.OpenAiAudioTranscriptionClient;
import com.whatsapp.ai.agent.infrastructure.rest.EvolutionMediaClient;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class AgentMessageConsumer {

    @Inject
    @RestClient
    ConfigManagerClient configManagerClient;

    @Inject
    AgentMessageProducer messageProducer;

    @Inject
    ChatMemoryProvider chatMemoryProvider;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class IncomingMessage {
        public String instance;
        public Data data;
        
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class Data {
            public Message message;
            public Key key;
            public String pushName;
            public String base64;
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class Message {
            public String conversation;
            public ExtendedTextMessage extendedTextMessage;
            public Object imageMessage;
            public Object audioMessage;
            public Object documentMessage;
            public String base64;
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class ExtendedTextMessage {
            public String text;
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class Key {
            public String id;
            public String remoteJid;
            public Boolean fromMe;
        }
    }

    @Inject
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Incoming("whatsapp-message-received")
    @io.smallrye.reactive.messaging.annotations.Blocking
    public void consume(String payloadString) {
        System.out.println("Received raw payload: " + payloadString);
        try {
            IncomingMessage payload = objectMapper.readValue(payloadString, IncomingMessage.class);
            if (payload != null && payload.data != null && payload.data.key != null) {
                if (Boolean.TRUE.equals(payload.data.key.fromMe)) {
                    return; // Ignore fromMe
                }
                
                String remoteJid = payload.data.key.remoteJid;
                if (remoteJid != null && remoteJid.contains("@g.us")) {
                    System.out.println("Ignored group message from: " + remoteJid);
                    return; // Ignore group messages
                }
                
                String pushName = payload.data.pushName != null ? payload.data.pushName : "Usuário";
                String text = "";
                if (payload.data.message != null) {
                    if (payload.data.message.conversation != null) {
                        text = payload.data.message.conversation;
                    } else if (payload.data.message.extendedTextMessage != null && payload.data.message.extendedTextMessage.text != null) {
                        text = payload.data.message.extendedTextMessage.text;
                    } else if (payload.data.message.audioMessage != null) {
                        try {
                            String base64 = null;
                            String mimetype = "audio/ogg";

                            if (payload.data.message.audioMessage instanceof java.util.Map) {
                                @SuppressWarnings("unchecked")
                                java.util.Map<String, Object> audioMap = (java.util.Map<String, Object>) payload.data.message.audioMessage;
                                if (audioMap.containsKey("base64")) {
                                    base64 = (String) audioMap.get("base64");
                                }
                                if (audioMap.containsKey("mimetype")) {
                                    mimetype = (String) audioMap.get("mimetype");
                                }
                            }

                            if (base64 == null && payload.data.base64 != null) {
                                base64 = payload.data.base64;
                            }
                            if (base64 == null && payload.data.message.base64 != null) {
                                base64 = payload.data.message.base64;
                            }

                            // Fallback: fetch from Evolution API if not in webhook payload
                            if (base64 == null && payload.data.key != null && payload.data.key.id != null) {
                                System.out.println("Fetching audio base64 on-demand from Evolution for message ID: " + payload.data.key.id);
                                base64 = EvolutionMediaClient.getBase64Media(payload.instance, payload.data.key.id, payload.data.message.audioMessage);
                            }

                            if (base64 != null && !base64.trim().isEmpty()) {
                                var config = configManagerClient.getByPhoneNumber(payload.instance);
                                String encryptedApiKey = config != null && config.aiApiKey != null ? config.aiApiKey : "";
                                String apiKey = EncryptionUtil.decrypt(encryptedApiKey);
                                
                                text = OpenAiAudioTranscriptionClient.transcribe(apiKey, base64, mimetype);
                                System.out.println("Audio transcribed successfully: " + text);
                            } else {
                                System.err.println("Could not obtain base64 for audio message: " + (payload.data.key != null ? payload.data.key.id : "null"));
                                text = "[Áudio Recebido sem Base64]";
                            }
                        } catch (Exception e) {
                            System.err.println("Failed to transcribe audio: " + e.getMessage());
                            e.printStackTrace();
                            text = "[Falha ao transcrever o áudio]";
                        }
                    } else if (payload.data.message.imageMessage != null) {
                        text = "[O usuário enviou uma imagem/foto. Você não consegue ver a imagem, então apenas avise que recebeu]";
                    } else if (payload.data.message.documentMessage != null) {
                        text = "[O usuário enviou um documento (PDF, Doc, etc). Você não consegue ler ainda, então avise que recebeu e guardou]";
                    }
                }
                
                if (text == null || text.trim().isEmpty()) {
                    System.out.println("Ignored empty or non-text message.");
                    return;
                }

                // Check if AI is active for this user
                try {
                    var leadStatus = configManagerClient.getLeadStatus(payload.instance, remoteJid);
                    if (leadStatus != null && Boolean.FALSE.equals(leadStatus.aiActive)) {
                        System.out.println("AI paused for lead: " + remoteJid);
                        return; // Ignore
                    }
                } catch (Exception e) {
                    System.err.println("Failed to check lead status: " + e.getMessage());
                }

                var config = configManagerClient.getByPhoneNumber(payload.instance);
                String systemPrompt = config != null ? config.systemPrompt : "Você é um assistente útil.";
                String provider = config != null && config.aiProvider != null ? config.aiProvider : "OPENAI";
                String aiModel = config != null && config.aiModel != null ? config.aiModel : "gpt-4o";
                String encryptedApiKey = config != null && config.aiApiKey != null ? config.aiApiKey : "demo";
                String apiKey = EncryptionUtil.decrypt(encryptedApiKey);

                ChatLanguageModel model;
                
                if ("OPENROUTER".equalsIgnoreCase(provider)) {
                    model = OpenAiChatModel.builder()
                            .baseUrl("https://openrouter.ai/api/v1")
                            .apiKey(apiKey)
                            .modelName(aiModel)
                            .build();
                } else if ("GEMINI".equalsIgnoreCase(provider)) {
                    // For Gemini, we might need a Gemini builder, or if using langchain4j with OpenAI compatibility:
                    model = OpenAiChatModel.builder()
                            .baseUrl("https://generativelanguage.googleapis.com/v1beta/openai/") // Assuming Gemini OpenAI compat
                            .apiKey(apiKey)
                            .modelName(aiModel)
                            .build();
                } else {
                    // Default to OpenAI
                    model = OpenAiChatModel.builder()
                            .apiKey(apiKey)
                            .modelName(aiModel)
                            .build();
                }

                LeadQualificationTool qualTool = new LeadQualificationTool(payload.instance, remoteJid, configManagerClient, messageProducer);

                AiAgentService dynamicAgent = AiServices.builder(AiAgentService.class)
                        .chatLanguageModel(model)
                        .chatMemoryProvider(chatMemoryProvider)
                        .tools(qualTool)
                        .build();

                String reply = dynamicAgent.chat(remoteJid, text, systemPrompt);
                messageProducer.sendReply(payload.instance, remoteJid, reply);
            }
        } catch (Exception e) {
            System.err.println("Error processing AI request: " + e.getMessage());
            e.printStackTrace();
        }
    }
}