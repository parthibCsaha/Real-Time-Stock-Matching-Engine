package com.stock_trading_engine.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades", indexes = {
        @Index(name = "idx_symbol_timestamp", columnList = "symbol, timestamp"),
        @Index(name = "idx_buy_order", columnList = "buy_order_id"),
        @Index(name = "idx_sell_order", columnList = "sell_order_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "buy_order_id", nullable = false)
    private String buyOrderId;

    @Column(name = "sell_order_id", nullable = false)
    private String sellOrderId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(nullable = false)
    private long quantity;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "buyer_id")
    private String buyerId;

    @Column(name = "seller_id")
    private String sellerId;

}
