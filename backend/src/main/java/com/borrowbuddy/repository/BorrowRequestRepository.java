package com.borrowbuddy.repository;

import com.borrowbuddy.model.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRequestRepository
        extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByRequesterId(Long requesterId);

    List<BorrowRequest> findByItemOwnerId(Long ownerId);

    boolean existsByItemIdAndRequesterIdAndStatus(
            Long itemId,
            Long requesterId,
            String status
    );
}