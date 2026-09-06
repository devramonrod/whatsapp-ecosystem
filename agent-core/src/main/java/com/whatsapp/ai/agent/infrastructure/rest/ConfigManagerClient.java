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

    class TenantConfigDTO {
        public Long id;
        public String phoneNumberId;
        public String businessType;
        public String systemPrompt;
        public String aiProvider;
        public String aiApiKey;
    }
}
