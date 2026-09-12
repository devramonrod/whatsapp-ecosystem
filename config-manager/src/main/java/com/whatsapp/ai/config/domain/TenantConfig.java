package com.whatsapp.ai.config.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;

@Entity
public class TenantConfig extends PanacheEntity {
    
    public String userId; // SaaS multi-tenancy user ID owner

    public String phoneNumberId; // e.g., the Evolution instance name or phone number
    public String businessType;  // e.g., "Imobiliaria", "Advocacia"
    
    @Column(columnDefinition = "TEXT")
    public String systemPrompt;  // The AI personality and rules
    
    public String aiProvider; // e.g., "OPENAI" or "GEMINI"
    
    public String aiModel; // e.g., "gpt-4o", "gemini-1.5-pro"
    
    public String notificationNumbers; // e.g. "5521999999999,5511888888888"
    
    @Column(columnDefinition = "TEXT")
    public String aiApiKey;
    
    public static TenantConfig findByPhoneNumber(String phoneNumberId) {
        return find("phoneNumberId", phoneNumberId).firstResult();
    }
}
