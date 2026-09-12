package com.whatsapp.ai.config.infrastructure.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

@Path("/api/messages/send")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageSenderResource {

    @Inject
    @Channel("whatsapp-message-out")
    Emitter<String> messageEmitter;

    @Inject
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public static class SendRequest {
        public String instanceName;
        public String remoteJid;
        public String text;
    }

    @POST
    public Response sendMessage(SendRequest request) {
        if (request == null || request.instanceName == null || request.remoteJid == null || request.text == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Missing fields").build();
        }

        try {
            // Disable AI automatically when user replies manually
            com.whatsapp.ai.config.domain.ChatLead lead = com.whatsapp.ai.config.domain.ChatLead.findByInstanceAndJid(request.instanceName, request.remoteJid);
            if (lead != null && Boolean.TRUE.equals(lead.aiActive)) {
                jakarta.transaction.TransactionManager tm = io.quarkus.hibernate.orm.panache.Panache.getTransactionManager();
                tm.begin();
                lead.aiActive = false;
                lead.persist();
                tm.commit();
            }

            // Create payload for Kafka
            com.fasterxml.jackson.databind.node.ObjectNode payload = objectMapper.createObjectNode();
            payload.put("instanceName", request.instanceName);
            payload.put("remoteJid", request.remoteJid);
            payload.put("responseText", request.text);

            messageEmitter.send(objectMapper.writeValueAsString(payload));
            
            return Response.ok().entity("{\"status\":\"sent\", \"aiPaused\": true}").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity("Failed to send: " + e.getMessage()).build();
        }
    }
}

