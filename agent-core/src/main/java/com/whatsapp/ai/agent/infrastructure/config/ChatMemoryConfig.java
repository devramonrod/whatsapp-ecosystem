package com.whatsapp.ai.agent.infrastructure.config;

import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import dev.langchain4j.store.memory.chat.InMemoryChatMemoryStore;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

@ApplicationScoped
public class ChatMemoryConfig {

    @Produces
    @Singleton
    public ChatMemoryStore chatMemoryStore() {
        // Inicialmente mantemos em memória (RAM). 
        // No futuro, podemos trocar facilmente para o RedisChatMemoryStore!
        return new InMemoryChatMemoryStore();
    }

    @Produces
    @Singleton
    public ChatMemoryProvider chatMemoryProvider(ChatMemoryStore store) {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId) // Usa o número de WhatsApp como ID único da memória
                .chatMemoryStore(store)
                .maxMessages(50) // Lembra das últimas 50 mensagens
                .build();
    }
}

