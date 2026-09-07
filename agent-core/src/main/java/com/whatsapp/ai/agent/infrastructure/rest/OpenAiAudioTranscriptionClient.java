package com.whatsapp.ai.agent.infrastructure.rest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

public class OpenAiAudioTranscriptionClient {

    private static final String API_URL = "https://api.openai.com/v1/audio/transcriptions";
    private static final HttpClient httpClient = HttpClient.newBuilder().build();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String transcribe(String apiKey, String base64Audio, String mimeType) throws Exception {
        if (base64Audio == null || base64Audio.trim().isEmpty()) {
            throw new IllegalArgumentException("Base64 audio string is null or empty");
        }
        
        // Strip data URI prefix if present (e.g. data:audio/ogg;base64,...)
        if (base64Audio.contains(",")) {
            base64Audio = base64Audio.substring(base64Audio.indexOf(",") + 1);
        }
        base64Audio = base64Audio.replaceAll("\\s+", "");

        byte[] audioBytes = Base64.getDecoder().decode(base64Audio);
        String boundary = "----Boundary" + UUID.randomUUID().toString().replace("-", "");

        String cleanMime = (mimeType != null && !mimeType.isEmpty()) ? mimeType.split(";")[0].trim() : "audio/ogg";
        String fileExt = "ogg";
        if (cleanMime.contains("mp4") || cleanMime.contains("m4a")) {
            fileExt = "m4a";
        } else if (cleanMime.contains("mp3") || cleanMime.contains("mpeg")) {
            fileExt = "mp3";
        } else if (cleanMime.contains("wav")) {
            fileExt = "wav";
        }
        String filename = "audio." + fileExt;

        byte[] boundaryBytes = ("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8);
        byte[] fileHeaderBytes = ("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\nContent-Type: " + cleanMime + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
        byte[] crlfBytes = "\r\n".getBytes(StandardCharsets.UTF_8);
        byte[] modelHeaderBytes = ("--" + boundary + "\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nwhisper-1\r\n").getBytes(StandardCharsets.UTF_8);
        byte[] endBoundaryBytes = ("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);

        java.io.ByteArrayOutputStream byteStream = new java.io.ByteArrayOutputStream();
        byteStream.write(boundaryBytes);
        byteStream.write(fileHeaderBytes);
        byteStream.write(audioBytes);
        byteStream.write(crlfBytes);
        byteStream.write(modelHeaderBytes);
        byteStream.write(endBoundaryBytes);

        byte[] requestBody = byteStream.toByteArray();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Whisper response status: " + response.statusCode());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = mapper.readTree(response.body());
            if (rootNode.has("text")) {
                return rootNode.get("text").asText();
            }
        }
        
        throw new RuntimeException("OpenAI Whisper API error (status " + response.statusCode() + "): " + response.body());
    }
}