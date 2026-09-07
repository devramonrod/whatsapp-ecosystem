package com.whatsapp.ai.gateway.infrastructure.messaging;

import com.whatsapp.ai.gateway.domain.EvolutionWebhookPayload;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

@ApplicationScoped
public class MessageProducer {

    @jakarta.inject.Inject
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Channel("whatsapp-message-received")
    Emitter<String> emitter;

    public void sendRawToKafka(String rawJson) {
        if (rawJson != null && !rawJson.trim().isEmpty()) {
            emitter.send(rawJson);
        }
    }

    public void sendToKafka(EvolutionWebhookPayload payload) {
        if (payload != null && payload.data != null && payload.data.message != null) {
            try {
                String json = objectMapper.writeValueAsString(payload);
                emitter.send(json);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

