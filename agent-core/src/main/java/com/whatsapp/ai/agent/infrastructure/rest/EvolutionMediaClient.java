package com.whatsapp.ai.agent.infrastructure.rest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.HashMap;

public class EvolutionMediaClient {

    private static final String EVOLUTION_URL = System.getenv().getOrDefault("EVOLUTION_API_URL", "http://evolution-api:8080");
    private static final String EVOLUTION_API_KEY = System.getenv().getOrDefault("EVOLUTION_API_KEY", "");
    private static final HttpClient httpClient = HttpClient.newBuilder().build();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String getBase64Media(String instance, String messageId, Object audioMessage) {
        try {
            Map<String, Object> reqBody = new HashMap<>();
            Map<String, Object> messageMap = new HashMap<>();
            Map<String, Object> keyMap = new HashMap<>();
            keyMap.put("id", messageId);
            messageMap.put("key", keyMap);
            if (audioMessage != null) {
                Map<String, Object> subMsg = new HashMap<>();
                subMsg.put("audioMessage", audioMessage);
                messageMap.put("message", subMsg);
            }
            reqBody.put("message", messageMap);
            reqBody.put("convertToMp4", false);

            String bodyJson = mapper.writeValueAsString(reqBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EVOLUTION_URL + "/chat/getBase64FromMediaMessage/" + instance))
                    .header("Content-Type", "application/json")
                    .header("apikey", EVOLUTION_API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Evolution getBase64 status: " + response.statusCode());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = mapper.readTree(response.body());
                if (root.has("base64")) {
                    return root.get("base64").asText();
                }
            } else {
                System.err.println("Evolution getBase64 failed: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Error calling Evolution getBase64: " + e.getMessage());
        }
        return null;
    }
}