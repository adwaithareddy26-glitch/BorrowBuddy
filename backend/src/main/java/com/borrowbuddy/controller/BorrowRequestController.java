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

import java.util.List;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

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


    // Create a borrow request
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


        // Prevent requesting your own item
        if (item.getOwner().getId().equals(requester.getId())) {

            return ResponseEntity.badRequest()
                    .body("You cannot request your own item");
        }


        // Check item availability
        if (!item.isAvailable()) {

            return ResponseEntity.badRequest()
                    .body("This item is not available");
        }


        // Prevent duplicate pending request
        boolean alreadyRequested =
                requestRepository
                        .existsByItemIdAndRequesterIdAndStatus(
                                itemId,
                                requester.getId(),
                                "PENDING"
                        );

        if (alreadyRequested) {

            return ResponseEntity.badRequest()
                    .body("You have already requested this item");
        }


        try {

            LocalDate startDate =
                    LocalDate.parse(borrowDate);

            LocalDate endDate =
                    LocalDate.parse(returnDate);


            // Borrow date cannot be in the past
            if (startDate.isBefore(LocalDate.now())) {

                return ResponseEntity.badRequest()
                        .body("Borrow date cannot be in the past");
            }


            // Return date must be after borrow date
            if (!endDate.isAfter(startDate)) {

                return ResponseEntity.badRequest()
                        .body("Return date must be after borrow date");
            }


            // Calculate number of borrowing days
            long days =
                    ChronoUnit.DAYS.between(
                            startDate,
                            endDate
                    );


            BorrowRequest request =
                    new BorrowRequest();

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

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Invalid date format. Use YYYY-MM-DD");
        }
    }


    // Get requests sent by logged-in student
    @GetMapping("/my-requests")
    public ResponseEntity<List<BorrowRequest>> getMyRequests(
            @AuthenticationPrincipal String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                requestRepository.findByRequesterId(
                        requester.getId()
                )
        );
    }


    // Get requests received by logged-in item owner
    @GetMapping("/received")
    public ResponseEntity<List<BorrowRequest>> getReceivedRequests(
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                requestRepository.findByItemOwnerId(
                        owner.getId()
                )
        );
    }


    // Approve or reject a borrow request
    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status,
            @AuthenticationPrincipal String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        BorrowRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException("Request not found"));


        // Only the item owner can approve/reject
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


        request.setStatus(status.toUpperCase());

        Item item = request.getItem();


        if (status.equalsIgnoreCase("APPROVED")) {

            item.setAvailable(false);

            itemRepository.save(item);
        }


        if (status.equalsIgnoreCase("REJECTED")) {

            item.setAvailable(true);

            itemRepository.save(item);
        }


        BorrowRequest updatedRequest =
                requestRepository.save(request);

        return ResponseEntity.ok(updatedRequest);
    }


    // Return borrowed item
    @PutMapping("/{requestId}/return")
    public ResponseEntity<?> returnItem(
            @PathVariable Long requestId,
            @AuthenticationPrincipal String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        BorrowRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException("Request not found"));


        // Only the borrower can return the item
        if (!request.getRequester().getId()
                .equals(requester.getId())) {

            return ResponseEntity.status(403)
                    .body("You are not allowed to return this item");
        }


        // Only approved requests can be returned
        if (!request.getStatus().equals("APPROVED")) {

            return ResponseEntity.badRequest()
                    .body("Only an approved request can be returned");
        }


        // Today's date
        LocalDate actualReturnDate =
                LocalDate.now();

        request.setActualReturnDate(
                actualReturnDate
        );


        // Calculate late days
        long lateDays = 0;

        if (actualReturnDate.isAfter(
                request.getReturnDate())) {

            lateDays = ChronoUnit.DAYS.between(
                    request.getReturnDate(),
                    actualReturnDate
            );
        }


        // ₹10 penalty for each late day
        double penalty =
                lateDays * 10.0;

        request.setPenalty(penalty);

        request.setStatus("RETURNED");


        // Make item available again
        Item item = request.getItem();

        item.setAvailable(true);

        itemRepository.save(item);


        BorrowRequest updatedRequest =
                requestRepository.save(request);

        return ResponseEntity.ok(updatedRequest);
    }
}