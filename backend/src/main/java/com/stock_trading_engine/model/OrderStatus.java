package com.stock_trading_engine.model;

public enum OrderStatus {

    PENDING,      // Order received but not yet processed
    OPEN,         // Order in the book, waiting to be matched
    PARTIALLY_FILLED, // Order partially executed
    FILLED,       // Order fully executed
    CANCELLED     // Order cancelled

}
