package com.whatsapp.ai.config.infrastructure.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
public class TenantConfigResourceTest {

    @Test
    public void testCreateAndGetTenantConfigWithAiModel() {
        String payload = "{"
                + "\"phoneNumberId\": \"test-instance-123\","
                + "\"businessType\": \"Test Business\","
                + "\"systemPrompt\": \"You are a bot\","
                + "\"aiProvider\": \"OPENROUTER\","
                + "\"aiModel\": \"anthropic/claude-3-haiku\","
                + "\"aiApiKey\": \"sk-or-test1234\""
                + "}";

        // Create
        given()
          .header("X-User-ID", "user-123")
          .contentType(ContentType.JSON)
          .body(payload)
          .when().post("/api/tenants")
          .then()
             .statusCode(201)
             .body("id", notNullValue())
             .body("aiProvider", is("OPENROUTER"))
             .body("aiModel", is("anthropic/claude-3-haiku"));
             
        // Get
        given()
          .when().get("/api/tenants/test-instance-123")
          .then()
             .statusCode(200)
             .body("aiProvider", is("OPENROUTER"))
             .body("aiModel", is("anthropic/claude-3-haiku"));
    }
}
