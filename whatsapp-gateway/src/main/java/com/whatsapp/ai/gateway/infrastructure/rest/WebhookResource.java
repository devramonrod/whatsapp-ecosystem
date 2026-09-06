package com.whatsapp.ai.gateway.infrastructure.rest;

import com.whatsapp.ai.gateway.domain.EvolutionWebhookPayload;
import com.whatsapp.ai.gateway.infrastructure.messaging.MessageProducer;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

@Path("/webhook")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WebhookResource {

    @Inject
    MessageProducer messageProducer;

    @POST
    @Path("/evolution")
    public Response receiveEvolutionWebhook(EvolutionWebhookPayload payload) {
        // Ignore messages sent by the bot itself
        if (payload.data != null && payload.data.key != null && payload.data.key.fromMe) {
            return Response.accepted(Map.of("status", "IGNORED_FROM_ME")).build();
        }
        
        // Push to Kafka
        messageProducer.sendToKafka(payload);

        return Response.accepted(Map.of("status", "ACCEPTED")).status(202).build();
    }
}

