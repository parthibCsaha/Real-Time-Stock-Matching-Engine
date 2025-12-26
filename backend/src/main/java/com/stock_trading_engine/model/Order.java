package com.stock_trading_engine.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    private String id;
    private String symbol;
    private OrderType type;
    private BigDecimal price;
    private long quantity;
    private long remainingQuantity;
    private LocalDateTime timestamp;
    private OrderStatus status;
    private String userId;

    public static Order createNew(String symbol, OrderType type,
                                  BigDecimal price, long quantity, String userId) {
        return Order.builder()
                .id(UUID.randomUUID().toString())
                .symbol(symbol)
                .type(type)
                .price(price)
                .quantity(quantity)
                .remainingQuantity(quantity)
                .timestamp(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .userId(userId)
                .build();
    }

    public boolean isActive() {
        return remainingQuantity > 0 &&
                (status == OrderStatus.OPEN || status == OrderStatus.PARTIALLY_FILLED);
    }
}