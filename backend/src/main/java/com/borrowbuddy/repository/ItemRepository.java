package com.borrowbuddy.repository;

import com.borrowbuddy.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByAvailableTrue();

    List<Item> findByCategoryIgnoreCase(String category);

    List<Item> findByNameContainingIgnoreCase(String name);

    List<Item> findByOwnerId(Long ownerId);

}