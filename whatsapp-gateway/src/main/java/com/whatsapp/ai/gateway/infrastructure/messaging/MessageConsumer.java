package com.whatsapp.ai.gateway.infrastructure.messaging;

import com.whatsapp.ai.gateway.infrastructure.rest.EvolutionApiClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class MessageConsumer {

    @Inject
    @RestClient
    EvolutionApiClient evolutionApiClient;

    @ConfigProperty(name = "evolution.api.key")
    String apikey;

    public static class OutgoingMessage {
        public String instanceName;
        public String remoteJid;
        public String responseText;
    }

    @Inject
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Incoming("whatsapp-message-send")
    @io.smallrye.reactive.messaging.annotations.Blocking
    public void consume(String msgString) {
        try {
            OutgoingMessage msg = objectMapper.readValue(msgString, OutgoingMessage.class);
            if (msg != null && msg.remoteJid != null && msg.responseText != null && msg.instanceName != null) {
                System.out.println("Gateway routing message to Evolution API for: " + msg.remoteJid + " via instance: " + msg.instanceName);
                
                // Extract pure number if it contains @s.whatsapp.net
                String number = msg.remoteJid.split("@")[0];
                
                evolutionApiClient.sendText(
                    msg.instanceName, 
                    apikey, 
                    new EvolutionApiClient.SendMessagePayload(number, msg.responseText)
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send message via Evolution API: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

