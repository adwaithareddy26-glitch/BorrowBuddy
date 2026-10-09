package com.borrowbuddy.controller;

import com.borrowbuddy.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    // AI Borrowing Assistant
    @PostMapping("/ask")
    public ResponseEntity<?> askAI(
            @RequestBody Map<String, String> request) {

        String message = request.get("message");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "Message cannot be empty"
                    ));
        }

        try {
            String response = aiService.askAI(message);

            return ResponseEntity.ok(
                    Map.of("response", response)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            "AI service failed. Check the backend logs."
                    ));
        }
    }

    // AI Item Description Generator
    @PostMapping("/generate-description")
    public ResponseEntity<?> generateDescription(
            @RequestBody Map<String, String> request) {

        String name = request.get("name");
        String category = request.get("category");

        if (name == null || name.trim().isEmpty()
                || category == null || category.trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "Item name and category are required"
                    ));
        }

        String prompt = """
                Generate a useful description for an item listed
                on BorrowBuddy, a college campus borrowing platform.

                Item name: %s
                Category: %s

                Write 2 to 4 sentences describing its likely use
                for students. Do not invent specifications,
                condition, accessories, or unprovided features.
                """.formatted(name.trim(), category.trim());

        try {
            String description = aiService.askAI(prompt);

            return ResponseEntity.ok(
                    Map.of("description", description)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            "Unable to generate description. Check backend logs."
                    ));
        }
    }
}
