package com.whatsapp.ai.agent.infrastructure.messaging;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

@ApplicationScoped
public class AgentMessageProducer {

    @jakarta.inject.Inject
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Channel("whatsapp-message-send")
    Emitter<String> emitter;

    public static class OutgoingMessage {
        public String instanceName;
        public String remoteJid;
        public String responseText;
        
        public OutgoingMessage(String instanceName, String remoteJid, String responseText) {
            this.instanceName = instanceName;
            this.remoteJid = remoteJid;
            this.responseText = responseText;
        }
    }

    public void sendReply(String instanceName, String remoteJid, String responseText) {
        try {
            String json = objectMapper.writeValueAsString(new OutgoingMessage(instanceName, remoteJid, responseText));
            emitter.send(json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

