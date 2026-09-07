package com.whatsapp.ai.config.infrastructure.rest;

import com.whatsapp.ai.config.domain.MessageLog;
import com.whatsapp.ai.config.domain.TenantConfig;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import io.quarkus.panache.common.Sort;
import java.util.HashMap;
import java.util.Map;

@Path("/api/messages")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageLogResource {

    @GET
    @Path("/{instanceName}")
    public List<MessageLog> getMessages(@PathParam("instanceName") String instanceName, @HeaderParam("X-User-ID") String userId) {
        if (userId == null) return java.util.Collections.emptyList();
        
        // Ensure this instance belongs to the user
        TenantConfig config = TenantConfig.find("phoneNumberId = ?1 and userId = ?2", instanceName, userId).firstResult();
        if (config == null) return java.util.Collections.emptyList();

        return MessageLog.find("instanceName", Sort.descending("timestamp"), instanceName)
                         .page(0, 100)
                         .list();
    }

    @GET
    @Path("/metrics")
    public Map<String, Object> getMetrics(@HeaderParam("X-User-ID") String userId) {
        Map<String, Object> metrics = new HashMap<>();
        
        if (userId == null) {
            metrics.put("totalMessages", 0L);
            metrics.put("totalTokens", 0L);
            metrics.put("totalCost", 0.0);
            return metrics;
        }
        
        long totalMessages = MessageLog.count("instanceName IN (SELECT t.phoneNumberId FROM TenantConfig t WHERE t.userId = ?1)", userId);
        metrics.put("totalMessages", totalMessages);
        
        long totalTokens = 0;
        double totalCost = 0.0;
        
        try {
            Object[] sums = (Object[]) MessageLog.getEntityManager()
                .createQuery("SELECT COALESCE(SUM(m.tokens), 0), COALESCE(SUM(m.cost), 0.0) FROM MessageLog m WHERE m.instanceName IN (SELECT t.phoneNumberId FROM TenantConfig t WHERE t.userId = :userId)")
                .setParameter("userId", userId)
                .getSingleResult();
            
            if (sums != null && sums.length == 2) {
                totalTokens = ((Number) sums[0]).longValue();
                totalCost = ((Number) sums[1]).doubleValue();
            }
        } catch (Exception e) {
            System.err.println("Failed to sum metrics: " + e.getMessage());
        }
        
        metrics.put("totalTokens", totalTokens);
        metrics.put("totalCost", totalCost);
        
        return metrics;
    }
}
