package com.phongtro247.housing.infrastructure.momo;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class MomoPaymentClient {

    private final RestClient restClient;

    public MomoPaymentClient(RestClient.Builder builder,
                             @Value("${app.payment.momo.api-url}") String apiUrl) {
        this.restClient = builder.baseUrl(apiUrl).build();
    }

    public JsonNode createOrder(Map<String, Object> request) {
        return restClient.post().uri("/v2/gateway/api/create")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode queryOrder(Map<String, Object> request) {
        return restClient.post().uri("/v2/gateway/api/query")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(JsonNode.class);
    }
}
