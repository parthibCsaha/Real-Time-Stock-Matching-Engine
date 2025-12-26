package com.stock_trading_engine.controller;

import com.stock_trading_engine.model.Order;
import com.stock_trading_engine.model.OrderStatus;
import com.stock_trading_engine.model.OrderType;
import com.stock_trading_engine.model.Trade;
import com.stock_trading_engine.orderbook.OrderBook;
import com.stock_trading_engine.service.MatchingEngineService;
import com.stock_trading_engine.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderController {

    private final MatchingEngineService matchingEngineService;
    private final TradeService tradeService;

    /*
     * Submit a new order
     * POST /api/orders
     */
    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> submitOrder(@Valid @RequestBody OrderRequest request) {
        log.info("Received order: {} {} {} @ {}",
                request.getType(), request.getQuantity(),
                request.getSymbol(), request.getPrice());

        // Create order
        Order order = Order.createNew(
                request.getSymbol(),
                request.getType(),
                request.getPrice(),
                request.getQuantity(),
                request.getUserId()
        );

        // Process order through matching engine
        List<Trade> trades = matchingEngineService.processOrder(order);

        // Build response
        OrderResponse response = OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .remainingQuantity(order.getRemainingQuantity())
                .executedTrades(trades.size())
                .message("Order processed successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    /*
     * Cancel an order
     * DELETE /api/orders/{symbol}/{orderId}
     */
    @DeleteMapping("/orders/{symbol}/{orderId}")
    public ResponseEntity<String> cancelOrder(
            @PathVariable String symbol,
            @PathVariable String orderId) {

        boolean cancelled = matchingEngineService.cancelOrder(symbol, orderId);

        if (cancelled) {
            return ResponseEntity.ok("Order cancelled successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /*
     * Get order book snapshot
     * GET /api/orderbook/{symbol}
     */
    @GetMapping("/orderbook/{symbol}")
    public ResponseEntity<OrderBook.OrderBookSnapshot> getOrderBook(
            @PathVariable String symbol) {

        OrderBook.OrderBookSnapshot snapshot =
                matchingEngineService.getOrderBookSnapshot(symbol);

        if (snapshot != null) {
            return ResponseEntity.ok(snapshot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /*
     * Get recent trades
     * GET /api/trades/{symbol}?limit=50
     */
    @GetMapping("/trades/{symbol}")
    public ResponseEntity<List<Trade>> getRecentTrades(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "50") int limit) {

        List<Trade> trades = tradeService.getRecentTrades(symbol, limit);
        return ResponseEntity.ok(trades);
    }

    // DTOs
    @lombok.Data
    public static class OrderRequest {
        private String symbol;
        private OrderType type;
        private java.math.BigDecimal price;
        private long quantity;
        private String userId;
    }

    @lombok.Data
    @lombok.Builder
    public static class OrderResponse {
        private String orderId;
        private OrderStatus status;
        private long remainingQuantity;
        private int executedTrades;
        private String message;
    }

}
