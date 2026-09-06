package com.whatsapp.ai.config.infrastructure.persistence;

import com.whatsapp.ai.config.domain.TenantConfig;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TenantConfigRepository implements PanacheRepository<TenantConfig> {
    
    public TenantConfig findByPhoneNumber(String phoneNumberId) {
        return find("phoneNumberId", phoneNumberId).firstResult();
    }
}

