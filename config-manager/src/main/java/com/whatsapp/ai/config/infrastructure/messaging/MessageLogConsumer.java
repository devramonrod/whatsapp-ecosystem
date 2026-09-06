package com.whatsapp.ai.config.infrastructure.messaging;

import com.whatsapp.ai.config.domain.MessageLog;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import java.time.LocalDateTime;

@ApplicationScoped
public class MessageLogConsumer {

    @Inject
    ObjectMapper objectMapper;

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

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class OutgoingMessage {
        public String instanceName;
        public String remoteJid;
        public String responseText;
    }

    @Incoming("whatsapp-message-received")
    @Transactional
    public void consumeReceived(String payloadString) {
        try {
            IncomingMessage payload = objectMapper.readValue(payloadString, IncomingMessage.class);
            if (payload != null && payload.data != null && payload.data.key != null) {
                String remoteJid = payload.data.key.remoteJid;
                
                if (remoteJid != null && remoteJid.contains("@g.us")) {
                    return; // Ignore groups
                }
                
                Boolean fromMe = Boolean.TRUE.equals(payload.data.key.fromMe);
                String pushName = payload.data.pushName != null ? payload.data.pushName : remoteJid.split("@")[0];
                
                String text = "";
                if (payload.data.message != null) {
                    if (payload.data.message.conversation != null) {
                        text = payload.data.message.conversation;
                    } else if (payload.data.message.extendedTextMessage != null && payload.data.message.extendedTextMessage.text != null) {
                        text = payload.data.message.extendedTextMessage.text;
                    } else if (payload.data.message.audioMessage != null) {
                        text = "🎤 [Áudio Recebido]";
                    } else if (payload.data.message.imageMessage != null) {
                        text = "📷 [Imagem Recebida]";
                    } else if (payload.data.message.documentMessage != null) {
                        text = "📄 [Documento Recebido]";
                    }
                }
                
                if (text == null || text.trim().isEmpty()) {
                    return;
                }
                
                MessageLog log = new MessageLog(payload.instance, remoteJid, pushName, fromMe, text);
                log.persist();
                
            }
        } catch (Exception e) {
            System.err.println("Failed to log message: " + e.getMessage());
        }
    }

    @Incoming("whatsapp-message-send")
    @Transactional
    public void consumeSend(String msgString) {
        try {
            OutgoingMessage msg = objectMapper.readValue(msgString, OutgoingMessage.class);
            if (msg != null && msg.remoteJid != null) {
                // Outgoing messages, we don't know the remote pushName directly here,
                // but we know it's a response to the user. We can just set pushName as null or "IA".
                MessageLog log = new MessageLog(msg.instanceName, msg.remoteJid, "IA", true, msg.responseText);
                log.persist();
            }
        } catch (Exception e) {
            System.err.println("Error saving sent message log: " + e.getMessage());
        }
    }
}
