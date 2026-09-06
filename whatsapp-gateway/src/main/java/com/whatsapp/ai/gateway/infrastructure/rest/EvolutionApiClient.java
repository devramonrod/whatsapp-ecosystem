package com.whatsapp.ai.gateway.infrastructure.rest;

import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "evolution-api")
public interface EvolutionApiClient {

    @POST
    @Path("/message/sendText/{instance}")
    void sendText(
        @PathParam("instance") String instance,
        @HeaderParam("apikey") String apikey,
        SendMessagePayload payload
    );

    class SendMessagePayload {
        public String number;
        public String text;
        public Integer delay;
        
        public SendMessagePayload(String number, String text) {
            this.number = number;
            this.text = text;
            this.delay = Math.min(10000, text.length() * 50); // delay of 50ms per character, max 10 seconds
        }
    }
}

