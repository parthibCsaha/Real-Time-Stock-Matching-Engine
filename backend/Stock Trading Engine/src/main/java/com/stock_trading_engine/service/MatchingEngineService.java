package com.stock_trading_engine.service;


import com.stock_trading_engine.model.Order;
import com.stock_trading_engine.model.Trade;
import com.stock_trading_engine.orderbook.OrderBook;
import com.stock_trading_engine.orderbook.OrderBookManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;


/*
 * Core service that orchestrates order processing and trade execution.
 * Handles async operations and WebSocket notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingEngineService {

    private final OrderBookManager orderBookManager;
    private final TradeService tradeService;
    private final SimpMessagingTemplate messagingTemplate;

    /*
     * Process a new order submission
     * This method is the entry point for all orders
     */
    public List<Trade> processOrder(Order order) {
        log.info("Processing order: {} {} {} @ {}",
                order.getType(), order.getQuantity(),
                order.getSymbol(), order.getPrice());

        // Add order to the book and get executed trades
        List<Trade> trades = orderBookManager.addOrder(order);

        if (!trades.isEmpty()) {
            processTradesAsync(trades);
        }

        // Broadcast order book update via WebSocket
        broadcastOrderBookUpdate(order.getSymbol());

        return trades;
    }

    /*
     * Asynchronously save trades and broadcast via WebSocket
     */
    @Async("taskExecutor")
    protected void processTradesAsync(List<Trade> trades) {
        try {
            // save trades to database
            tradeService.saveTrades(trades);

            for (Trade trade : trades) {
                messagingTemplate.convertAndSend("/topic/trades/" + trade.getSymbol(), trade);
                log.debug("Trade broadcasted: {}", trade.getId());
            }
        }
        catch (Exception e) {
            log.error("Error processing trades: {}", e.getMessage());
        }
    }

    /*
     * Broadcast order book snapshot update
     */
    private void broadcastOrderBookUpdate(String symbol) {
        try {
            OrderBook.OrderBookSnapshot snapshot = orderBookManager.getSnapshot(symbol);
            messagingTemplate.convertAndSend("/topic/orderbook/" + symbol, snapshot);
        } catch (Exception e) {
            log.error("Error broadcasting order book update", e);
        }
    }

    /*
     * Cancel an existing order
     */
    public boolean cancelOrder(String symbol, String orderId) {
        boolean cancelled = orderBookManager.cancelOrder(symbol, orderId);
        if (cancelled) {
            broadcastOrderBookUpdate(symbol);
        }
        return cancelled;
    }

    /*
     * Get current order book snapshot
     */
    public OrderBook.OrderBookSnapshot getOrderBookSnapshot(String symbol) {
        return orderBookManager.getSnapshot(symbol);
    }

}
