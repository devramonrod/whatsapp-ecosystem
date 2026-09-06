package com.whatsapp.ai.agent.application;

import com.whatsapp.ai.agent.domain.AiAgentService;

import com.whatsapp.ai.agent.infrastructure.messaging.AgentMessageProducer;
import com.whatsapp.ai.agent.infrastructure.rest.ConfigManagerClient;
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
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class Message {
            public String conversation;
            public ExtendedTextMessage extendedTextMessage;
            public Object imageMessage;
            public Object audioMessage;
            public Object documentMessage;
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class ExtendedTextMessage {
            public String text;
        }
        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        public static class Key {
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
                        text = "[O usuário enviou uma mensagem de áudio. Como você ainda não tem ouvidos (Transcrição Whisper), avise o usuário que você só consegue ler textos no momento]";
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

                
                var config = configManagerClient.getByPhoneNumber(payload.instance);
                String systemPrompt = config != null ? config.systemPrompt : "Você é um assistente útil.";
                String provider = config != null && config.aiProvider != null ? config.aiProvider : "OPENAI";
                String apiKey = config != null && config.aiApiKey != null ? config.aiApiKey : "demo";

                ChatLanguageModel model;
                if ("GEMINI".equalsIgnoreCase(provider)) {
                    // Placeholder for Gemini - using OpenAI temporarily to unblock build
                    System.out.println("WARN: Gemini not yet fully linked. Defaulting to OpenAI for now.");
                }
                
                model = OpenAiChatModel.builder()
                        .apiKey(apiKey)
                        .modelName("gpt-4o")
                        .build();

                AiAgentService dynamicAgent = AiServices.builder(AiAgentService.class)
                        .chatLanguageModel(model)
                        .chatMemoryProvider(chatMemoryProvider)
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
