package com.borrowbuddy.service;

import com.borrowbuddy.model.Item;
import com.borrowbuddy.repository.ItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ItemRepository itemRepository;

    public AIService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public String askAI(String userMessage) {

        try {

            // Get all currently available items
            List<Item> availableItems =
                    itemRepository.findByAvailableTrue();

            StringBuilder itemInformation = new StringBuilder();

            if (availableItems.isEmpty()) {

                itemInformation.append(
                        "There are currently no available items."
                );

            } else {

                for (Item item : availableItems) {

                    itemInformation.append(
                            "Name: "
                    ).append(item.getName());

                    itemInformation.append(
                            ", Category: "
                    ).append(item.getCategory());

                    itemInformation.append(
                            ", Description: "
                    ).append(item.getDescription());

                    itemInformation.append("\n");
                }
            }

            String systemMessage = """
                    You are BorrowBuddy AI, an intelligent assistant
                    for a college campus borrowing platform.

                    Help students with:
                    - Finding suitable items
                    - Understanding BorrowBuddy features
                    - Borrowing and returning items
                    - Explaining borrowing rules

                    IMPORTANT:
                    Use the available item information below when
                    answering questions about items.

                    Do not invent items.

                    If the requested item is not available, clearly
                    tell the student that it is not currently available.

                    Keep responses short, friendly, and useful.

                    AVAILABLE BORROWBUDDY ITEMS:
                    """ + itemInformation;

            String requestBody = objectMapper.writeValueAsString(
                    Map.of(
                            "model", model,

                            "messages", List.of(

                                    Map.of(
                                            "role",
                                            "system",
                                            "content",
                                            systemMessage
                                    ),

                                    Map.of(
                                            "role",
                                            "user",
                                            "content",
                                            userMessage
                                    )
                            ),

                            "temperature",
                            0.3
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .header(
                            "Authorization",
                            "Bearer " + apiKey
                    )
                    .POST(
                            HttpRequest.BodyPublishers
                                    .ofString(requestBody)
                    )
                    .build();

            HttpClient client =
                    HttpClient.newHttpClient();

            HttpResponse<String> response =
                    client.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() != 200) {

                throw new RuntimeException(
                        "Groq API error: " + response.body()
                );
            }

            JsonNode jsonResponse =
                    objectMapper.readTree(
                            response.body()
                    );

            return jsonResponse
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to communicate with Groq AI",
                    e
            );
        }
    }
}