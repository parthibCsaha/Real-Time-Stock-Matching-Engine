package com.stock_trading_engine.orderbook;

import com.stock_trading_engine.model.Order;
import com.stock_trading_engine.model.Trade;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/*
 * Manages OrderBooks for multiple trading symbols.
 * Thread-safe using ConcurrentHashMap.
 */
@Component
@Slf4j
public class OrderBookManager {

    private final ConcurrentHashMap<String, OrderBook> orderBooks;

    public OrderBookManager() {
        this.orderBooks = new ConcurrentHashMap<>();
        log.info("OrderBookManager initialized");
    }

    /*
     * Get or create an OrderBook for a symbol
     */
    public OrderBook getOrderBook(String symbol) {
        return orderBooks.computeIfAbsent(symbol, k -> new OrderBook(symbol));
    }

    /*
     * Add order and return executed trades
     */
    public List<Trade> addOrder(Order order) {
        OrderBook book = getOrderBook(order.getSymbol());
        return book.addOrder(order);
    }

    /*
     * Cancel an order
     */
    public boolean cancelOrder(String symbol, String orderId) {
        OrderBook book = orderBooks.get(symbol);
        return book != null && book.cancelOrder(orderId);
    }

    /*
     * Get order book snapshot
     */
    public OrderBook.OrderBookSnapshot getSnapshot(String symbol) {
        OrderBook book = orderBooks.get(symbol);
        return book != null ? book.getSnapshot() : null;
    }

}
