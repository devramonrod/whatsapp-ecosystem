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
    public Response receiveEvolutionWebhook(com.fasterxml.jackson.databind.JsonNode payloadNode) {
        if (payloadNode != null && payloadNode.has("data")) {
            var dataNode = payloadNode.get("data");
            if (dataNode.has("key") && dataNode.get("key").has("fromMe") && dataNode.get("key").get("fromMe").asBoolean(false)) {
                return Response.accepted(Map.of("status", "IGNORED_FROM_ME")).build();
            }
        }
        
        // Push full untouched JSON to Kafka
        messageProducer.sendRawToKafka(payloadNode != null ? payloadNode.toString() : "{}");

        return Response.accepted(Map.of("status", "ACCEPTED")).status(202).build();
    }
}

