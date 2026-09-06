package com.whatsapp.ai.config.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;

@Entity
public class TenantConfig extends PanacheEntity {
    
    public String phoneNumberId; // e.g., the Evolution instance name or phone number
    public String businessType;  // e.g., "Imobiliaria", "Advocacia"
    
    @Column(length = 2000)
    public String systemPrompt;  // The AI personality and rules
    
    public String aiProvider; // e.g., "OPENAI" or "GEMINI"
    public String aiApiKey;
    
    public static TenantConfig findByPhoneNumber(String phoneNumberId) {
        return find("phoneNumberId", phoneNumberId).firstResult();
    }
}
