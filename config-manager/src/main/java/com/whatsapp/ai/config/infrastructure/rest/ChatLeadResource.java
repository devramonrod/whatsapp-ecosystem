package com.whatsapp.ai.config.infrastructure.rest;

import com.whatsapp.ai.config.domain.ChatLead;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/api/leads")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChatLeadResource {

    @GET
    @Path("/{instanceName}/{remoteJid}")
    public ChatLead getLeadStatus(@PathParam("instanceName") String instanceName, @PathParam("remoteJid") String remoteJid) {
        ChatLead lead = ChatLead.find("instanceName = ?1 and remoteJid = ?2", instanceName, remoteJid).firstResult();
        if (lead == null) {
            // Default response if not exists
            return new ChatLead(instanceName, remoteJid);
        }
        return lead;
    }

    @POST
    @Path("/{instanceName}/{remoteJid}/toggle")
    @Transactional
    public Response toggleAiStatus(@PathParam("instanceName") String instanceName, @PathParam("remoteJid") String remoteJid, Map<String, Boolean> payload) {
        ChatLead lead = ChatLead.find("instanceName = ?1 and remoteJid = ?2", instanceName, remoteJid).firstResult();
        if (lead == null) {
            lead = new ChatLead(instanceName, remoteJid);
        }
        
        Boolean isActive = payload.get("aiActive");
        if (isActive != null) {
            lead.aiActive = isActive;
        } else {
            lead.aiActive = !lead.aiActive;
        }
        
        lead.persist();
        return Response.ok(lead).build();
    }
}
