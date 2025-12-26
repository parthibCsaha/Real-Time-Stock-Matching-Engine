package com.stock_trading_engine.orderbook;

import com.stock_trading_engine.model.Order;
import com.stock_trading_engine.model.OrderStatus;
import com.stock_trading_engine.model.OrderType;
import com.stock_trading_engine.model.Trade;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

/*
 * In-Memory Order Book for a single symbol.
 * Uses two PriorityQueues to maintain buy/sell orders sorted by price-time priority.

 * CRITICAL: All operations are thread-safe using ReentrantLock.
 */
@Slf4j
@Getter
public class OrderBook {

    private final String symbol;

    private final PriorityQueue<Order> buyOrders;

    private final PriorityQueue<Order> sellOrders;

    private final ReentrantLock lock;

    private final Map<String, Order> activeOrders;

    public OrderBook(String symbol) {
        this.symbol = symbol;

        // BUY orders: highest price first, then earliest time (FIFO)
        this.buyOrders = new PriorityQueue<>((a, b) -> {
            int priceCompare = b.getPrice().compareTo(a.getPrice());
            return priceCompare != 0 ? priceCompare : a.getTimestamp().compareTo(b.getTimestamp());
        });

        // SELL orders: lowest price first, then earliest time (FIFO)
        this.sellOrders = new PriorityQueue<>((a, b) -> {
            int priceCompare = a.getPrice().compareTo(b.getPrice());
            return priceCompare != 0 ? priceCompare : a.getTimestamp().compareTo(b.getTimestamp());
        });

        this.lock = new ReentrantLock(true);
        this.activeOrders = new HashMap<>();
        log.info("OrderBook initialized for symbol: {}", symbol);
    }


    /*
     * Add a new order to the book.
     * Returns list of trades executed during matching.
     */
    public List<Trade> addOrder(Order order) {
        lock.lock();
        try {
            log.debug("Adding order: {} {} {} @ {} (Qty: {})",
                    order.getId(), order.getType(), order.getSymbol(),
                    order.getPrice(), order.getQuantity());

            order.setStatus(OrderStatus.OPEN);
            activeOrders.put(order.getId(), order);

            // Add to appropriate queue
            if (order.getType() == OrderType.BUY) {
                buyOrders.offer(order);
            } else {
                sellOrders.offer(order);
            }

            return match();
        }
        finally {
            lock.unlock();
        }
    }

    /*
     * THE MATCHING ALGORITHM
     *
     * Continuously matches buy and sell orders while:
     * bestBuyPrice >= bestSellPrice
     *
     * This implements Price-Time Priority:
     * 1. Best price gets priority
     * 2. At same price, earliest order gets priority (FIFO)
     */
    public List<Trade> match() {
        // Lock is already held by caller (addOrder)
        List<Trade> executedTrades = new ArrayList<>();

        while (!buyOrders.isEmpty() && !sellOrders.isEmpty()) {
            Order bestBuy = buyOrders.peek();
            Order bestSell = sellOrders.peek();

            if (!bestBuy.isActive()) {
                buyOrders.poll();
                continue;
            }
            if (!bestSell.isActive()) {
                sellOrders.poll();
                continue;
            }

            // Check if prices cross (match condition)
            if (bestBuy.getPrice().compareTo(bestSell.getPrice()) < 0) {
                // No overlap: bestBuyPrice < bestSellPrice
                break;
            }

            // MATCH FOUND! Execute trade
            Trade trade = executeTrade(bestBuy, bestSell);
            executedTrades.add(trade);

            log.info("Trade executed: {} shares @ {} (Buy: {}, Sell: {})",
                    trade.getQuantity(), trade.getPrice(),
                    trade.getBuyOrderId(), trade.getSellOrderId());

            // Remove fully filled orders from queues
            if (bestBuy.getRemainingQuantity() == 0) {
                buyOrders.poll();
                bestBuy.setStatus(OrderStatus.FILLED);
                activeOrders.remove(bestBuy.getId());
            }
            if (bestSell.getRemainingQuantity() == 0) {
                sellOrders.poll();
                bestSell.setStatus(OrderStatus.FILLED);
                activeOrders.remove(bestSell.getId());
            }

        }

        return executedTrades;

    }

    /*
     * Execute a single trade between two orders.
     * Trade price is the MAKER's price (the order already in the book).
     * For sell order as maker: use sell price
     * For buy order as maker: use buy price
     */
    private Trade executeTrade(Order buyOrder, Order sellOrder) {
        long tradeQuantity = Math.min(buyOrder.getRemainingQuantity(),
                                    sellOrder.getRemainingQuantity());
        // Trade price: Use the price of the order that was in book first (maker)
        // In this implementation, we'll use the sell order price (passive side)
        BigDecimal tradePrice = sellOrder.getPrice();

        // Update order quantities
        buyOrder.setRemainingQuantity(buyOrder.getRemainingQuantity() - tradeQuantity);
        sellOrder.setRemainingQuantity(sellOrder.getRemainingQuantity() - tradeQuantity);

        // Update order status
        if (buyOrder.getRemainingQuantity() > 0) {
            buyOrder.setStatus(OrderStatus.PARTIALLY_FILLED);
        } else {
            buyOrder.setStatus(OrderStatus.FILLED);
        }

        if (sellOrder.getRemainingQuantity() > 0) {
            sellOrder.setStatus(OrderStatus.PARTIALLY_FILLED);
        } else {
            sellOrder.setStatus(OrderStatus.FILLED);
        }

        // Create trade record
        return Trade.builder()
                .symbol(symbol)
                .buyOrderId(buyOrder.getId())
                .sellOrderId(sellOrder.getId())
                .price(tradePrice)
                .quantity(tradeQuantity)
                .timestamp(java.time.LocalDateTime.now())
                .buyerId(buyOrder.getUserId())
                .sellerId(sellOrder.getUserId())
                .build();
    }

    /*
     * Cancel an order by ID
     */
    public boolean cancelOrder(String orderId) {
        lock.lock();
        try {
            Order order = activeOrders.remove(orderId);
            if (order != null) {
                order.setStatus(OrderStatus.CANCELLED);
                order.setRemainingQuantity(0);
                // Order remains in PriorityQueue but will be skipped due to status
                log.info("Order cancelled: {}", orderId);
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    /*
     * Get current order book snapshot (for display purposes)
     * Only returns active orders, properly sorted
     */
    public OrderBookSnapshot getSnapshot() {
        lock.lock();
        try {
            List<Order> activeBuys = buyOrders.stream()
                    .filter(Order::isActive)
                    .sorted((a, b) -> {
                        int p = b.getPrice().compareTo(a.getPrice());
                        return p != 0 ? p : a.getTimestamp().compareTo(b.getTimestamp());
                    })
                    .toList();

            List<Order> activeSells = sellOrders.stream()
                    .filter(Order::isActive)
                    .sorted((a, b) -> {
                        int p = a.getPrice().compareTo(b.getPrice());
                        return p != 0 ? p : a.getTimestamp().compareTo(b.getTimestamp());
                    })
                    .toList();

            return OrderBookSnapshot.builder()
                    .symbol(symbol)
                    .buyOrders(activeBuys)
                    .sellOrders(activeSells)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
        } finally {
            lock.unlock();
        }
    }

    @Builder
    @Data
    public static class OrderBookSnapshot {
        private String symbol;
        private List<Order> buyOrders;
        private List<Order> sellOrders;
        private java.time.LocalDateTime timestamp;
    }

}
