package com.whatsapp.ai.gateway.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EvolutionWebhookPayload {
    public String event;
    public String instance;
    public Data data;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        public Message message;
        public Key key;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        public String conversation;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Key {
        public String remoteJid;
        public boolean fromMe;
    }
}

