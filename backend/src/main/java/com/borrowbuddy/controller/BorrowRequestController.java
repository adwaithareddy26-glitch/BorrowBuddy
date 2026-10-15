package com.borrowbuddy.controller;

import com.borrowbuddy.model.BorrowRequest;
import com.borrowbuddy.model.Item;
import com.borrowbuddy.model.User;
import com.borrowbuddy.repository.BorrowRequestRepository;
import com.borrowbuddy.repository.ItemRepository;
import com.borrowbuddy.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class BorrowRequestController {

    private final BorrowRequestRepository requestRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public BorrowRequestController(
            BorrowRequestRepository requestRepository,
            ItemRepository itemRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // Create a borrowing request
    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestParam Long itemId,
            @RequestParam String borrowDate,
            @RequestParam String returnDate,
            @AuthenticationPrincipal String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() ->
                        new RuntimeException("Item not found"));

        // Prevent borrowing your own item
        if (item.getOwner().getId().equals(requester.getId())) {
            return ResponseEntity.badRequest()
                    .body("You cannot request your own item");
        }

        // Prevent duplicate requests for the same item
        boolean alreadyRequested =
        requestRepository.alreadyRequestedItem(
                itemId, requester.getId());

        if (alreadyRequested) {
            return ResponseEntity.badRequest()
                    .body("You have already requested this item");
        }

        // Check item availability
        if (!item.isAvailable()) {
            return ResponseEntity.badRequest()
                    .body("This item is not available");
        }

        try {
            LocalDate startDate = LocalDate.parse(borrowDate);
            LocalDate endDate = LocalDate.parse(returnDate);

            if (startDate.isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest()
                        .body("Borrow date cannot be in the past");
            }

            if (!endDate.isAfter(startDate)) {
                return ResponseEntity.badRequest()
                        .body("Return date must be after borrow date");
            }

            long days = ChronoUnit.DAYS.between(
                    startDate, endDate);

            BorrowRequest request = new BorrowRequest();
            request.setItem(item);
            request.setRequester(requester);
            request.setStatus("PENDING");
            request.setBorrowDate(startDate);
            request.setReturnDate(endDate);
            request.setBorrowDays((int) days);
            request.setPenalty(0.0);

            BorrowRequest savedRequest =
                    requestRepository.save(request);

            return ResponseEntity.ok(savedRequest);

        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid date format. Use YYYY-MM-DD");
        }
    }

    // View my borrowing requests
    @GetMapping("/my-requests")
    public ResponseEntity<List<BorrowRequest>> getMyRequests(
            @AuthenticationPrincipal String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                requestRepository.findByRequesterId(
                        requester.getId()));
    }

    // View requests received for my items
    @GetMapping("/received")
    public ResponseEntity<List<BorrowRequest>> getReceivedRequests(
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                requestRepository.findByItemOwnerId(
                        owner.getId()));
    }

    // Approve or reject a request
    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status,
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        BorrowRequest request = requestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        if (!request.getItem().getOwner().getId()
                .equals(owner.getId())) {

            return ResponseEntity.status(403)
                    .body("You are not allowed to update this request");
        }

        if (!status.equalsIgnoreCase("APPROVED")
                && !status.equalsIgnoreCase("REJECTED")) {

            return ResponseEntity.badRequest()
                    .body("Status must be APPROVED or REJECTED");
        }

        if (!request.getStatus().equals("PENDING")) {
            return ResponseEntity.badRequest()
                    .body("Only pending requests can be updated");
        }

        request.setStatus(status.toUpperCase());

        Item item = request.getItem();

        if (status.equalsIgnoreCase("APPROVED")) {
            item.setAvailable(false);
        } else {
            item.setAvailable(true);
        }

        itemRepository.save(item);

        BorrowRequest updatedRequest =
                requestRepository.save(request);

        return ResponseEntity.ok(updatedRequest);
    }

    // Return a borrowed item
    @PutMapping("/{requestId}/return")
    public ResponseEntity<?> returnItem(
            @PathVariable Long requestId,
            @AuthenticationPrincipal String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        BorrowRequest request = requestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Request not found"));

        if (!request.getRequester().getId()
                .equals(requester.getId())) {

            return ResponseEntity.status(403)
                    .body("You are not allowed to return this item");
        }

        if (!request.getStatus().equals("APPROVED")) {
            return ResponseEntity.badRequest()
                    .body("Only an approved request can be returned");
        }

        LocalDate actualReturnDate = LocalDate.now();
        request.setActualReturnDate(actualReturnDate);

        long lateDays = 0;

        if (actualReturnDate.isAfter(request.getReturnDate())) {
            lateDays = ChronoUnit.DAYS.between(
                    request.getReturnDate(), actualReturnDate);
        }

        double penalty = lateDays * 10.0;

        request.setPenalty(penalty);
        request.setStatus("RETURNED");

        Item item = request.getItem();
        item.setAvailable(true);
        itemRepository.save(item);

        BorrowRequest updatedRequest =
                requestRepository.save(request);

        return ResponseEntity.ok(updatedRequest);
    }
}
