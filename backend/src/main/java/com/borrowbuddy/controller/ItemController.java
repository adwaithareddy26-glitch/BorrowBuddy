package com.borrowbuddy.controller;

import com.borrowbuddy.model.Item;
import com.borrowbuddy.model.User;
import com.borrowbuddy.repository.ItemRepository;
import com.borrowbuddy.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemController(
            ItemRepository itemRepository,
            UserRepository userRepository) {

        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // Get all available items
    @GetMapping
public ResponseEntity<List<Item>> getAllItems() {
    return ResponseEntity.ok(itemRepository.findAll());
}
    // Add item
    @PostMapping
    public ResponseEntity<?> addItem(
            @RequestBody Item item,
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        item.setOwner(owner);
        item.setAvailable(true);

        Item savedItem = itemRepository.save(item);

        return ResponseEntity.ok(savedItem);
    }

    // Get items by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Item>> getByCategory(
            @PathVariable String category) {

        return ResponseEntity.ok(
                itemRepository.findByCategoryIgnoreCase(category)
        );
    }

    // Search items by name
    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchByName(
            @RequestParam String name) {

        return ResponseEntity.ok(
                itemRepository.findByNameContainingIgnoreCase(name)
        );
    }

    // Get items belonging to logged-in user
    @GetMapping("/my-items")
    public ResponseEntity<List<Item>> getMyItems(
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                itemRepository.findByOwnerId(owner.getId())
        );
    }
}