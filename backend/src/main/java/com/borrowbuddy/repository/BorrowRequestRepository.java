
package com.borrowbuddy.repository;

import com.borrowbuddy.model.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM BorrowRequest r
        WHERE r.item.id = :itemId
          AND r.requester.id = :requesterId
        """)
    boolean alreadyRequestedItem(
            @Param("itemId") Long itemId,
            @Param("requesterId") Long requesterId
    );
}
