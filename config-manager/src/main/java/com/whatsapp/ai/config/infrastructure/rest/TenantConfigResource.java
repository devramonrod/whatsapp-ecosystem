package com.whatsapp.ai.config.infrastructure.rest;

import com.whatsapp.ai.config.domain.TenantConfig;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/tenants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TenantConfigResource {

    @GET
    public List<TenantConfig> listAll(@HeaderParam("X-User-ID") String userId) {
        if (userId == null) return java.util.Collections.emptyList();
        return TenantConfig.find("userId", userId).list();
    }

    @GET
    @Path("/{phoneNumberId}")
    public Response getByPhoneNumber(@PathParam("phoneNumberId") String phoneNumberId) {
        TenantConfig config = TenantConfig.findByPhoneNumber(phoneNumberId);
        if (config == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(config).build();
    }

    @POST
    @Transactional
    public Response create(@HeaderParam("X-User-ID") String userId, TenantConfig config) {
        config.userId = userId;
        config.persist();
        return Response.status(Response.Status.CREATED).entity(config).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @HeaderParam("X-User-ID") String userId, TenantConfig updateConfig) {
        TenantConfig existing = TenantConfig.findById(id);
        if (existing == null || (existing.userId != null && !existing.userId.equals(userId))) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existing.phoneNumberId = updateConfig.phoneNumberId;
        existing.businessType = updateConfig.businessType;
        existing.systemPrompt = updateConfig.systemPrompt;
        existing.aiProvider = updateConfig.aiProvider;
        existing.aiModel = updateConfig.aiModel;
        existing.aiApiKey = updateConfig.aiApiKey;
        return Response.ok(existing).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id, @HeaderParam("X-User-ID") String userId) {
        TenantConfig existing = TenantConfig.findById(id);
        if (existing == null || (existing.userId != null && !existing.userId.equals(userId))) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existing.delete();
        return Response.noContent().build();
    }
}

