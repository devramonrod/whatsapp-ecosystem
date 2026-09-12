package com.whatsapp.ai.agent.infrastructure.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "config-manager-api")
@Path("/api/tenants")
public interface ConfigManagerClient {

    @GET
    @Path("/{phoneNumberId}")
    TenantConfigDTO getByPhoneNumber(@PathParam("phoneNumberId") String phoneNumberId);

    @GET
    @Path("/../leads/{instanceName}/{remoteJid}")
    ChatLeadDTO getLeadStatus(@PathParam("instanceName") String instanceName, @PathParam("remoteJid") String remoteJid);

    class TenantConfigDTO {
        public Long id;
        public String phoneNumberId;
        public String businessType;
        public String systemPrompt;
        public String aiProvider;
        public String aiModel;
        public String aiApiKey;
    }

    class ChatLeadDTO {
        public String instanceName;
        public String remoteJid;
        public Boolean aiActive;
    }
}
