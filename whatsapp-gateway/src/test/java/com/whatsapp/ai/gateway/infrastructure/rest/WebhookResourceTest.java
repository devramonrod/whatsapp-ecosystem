package com.whatsapp.ai.gateway.infrastructure.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class WebhookResourceTest {

    @Test
    public void testReceiveWebhookSuccess() {
        String payload = """
                {
                  "event": "messages.upsert",
                  "instance": "my-instance",
                  "data": {
                    "message": {
                      "conversation": "Olá, preciso de ajuda!"
                    },
                    "key": {
                      "remoteJid": "5511999999999@s.whatsapp.net",
                      "fromMe": false
                    }
                  }
                }
                """;

        given()
          .contentType(ContentType.JSON)
          .body(payload)
          .when().post("/webhook/evolution")
          .then()
             .statusCode(202)
             .body("status", is("ACCEPTED"));
    }
}

