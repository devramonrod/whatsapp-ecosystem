package com.whatsapp.ai.config.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class UserProfile extends PanacheEntityBase {
    
    @Id
    public String userId;

    public String name;
    public String companyName;
    public String role;

    public static UserProfile findByUserId(String userId) {
        return find("userId", userId).firstResult();
    }
}
