package com.whatsapp.ai.config.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"instanceName", "remoteJid"}))
public class ChatLead extends PanacheEntity {
    public String instanceName;
    public String remoteJid;
    public Boolean aiActive; // true = AI responds, false = AI ignores

    public ChatLead() {}
    
    public ChatLead(String instanceName, String remoteJid) {
        this.instanceName = instanceName;
        this.remoteJid = remoteJid;
        this.aiActive = true;
    }
}
