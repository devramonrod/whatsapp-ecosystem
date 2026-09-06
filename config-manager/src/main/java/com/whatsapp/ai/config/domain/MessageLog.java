package com.whatsapp.ai.config.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
public class MessageLog extends PanacheEntity {
    
    public String instanceName;
    public String remoteJid;
    public Boolean fromMe;
    
    @Column(columnDefinition = "TEXT")
    public String text;
    
    public String pushName;

    public LocalDateTime timestamp;
    
    public Integer tokens;
    public Double cost;

    public MessageLog() {}

    public MessageLog(String instanceName, String remoteJid, String pushName, Boolean fromMe, String text) {
        this.instanceName = instanceName;
        this.remoteJid = remoteJid;
        this.pushName = pushName;
        this.fromMe = fromMe;
        this.text = text;
        this.timestamp = LocalDateTime.now();
        
        // Estimativa simples de tokens (1 token = ~4 caracteres)
        this.tokens = text != null ? Math.max(1, text.length() / 4) : 0;
        // Custo médio ponderado GPT-4o (USD 10 por 1M tokens = USD 0.00001 por token)
        this.cost = this.tokens * 0.00001;
    }
}
