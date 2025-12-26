# 📈 Real-Time Stock Matching Engine (Full Stack)

[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.x-ff69b4?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

### 🚀 Project Overview
   This is a full-stack, real-time stock trading engine that simulates the core backend mechanics of a modern stock exchange.It implements a price–time priority limit order book, supports BUY/SELL orders, partial fills, trade execution,     and delivers live market updates to clients using WebSockets.This project focuses on backend system design, concurrency, and real-time data flow, rather than just CRUD operations.
---
### ⭐ Key Features
  ### 📊 Trading Engine (Backend Core)
   - Price–Time Priority Limit Order Book
   - BUY / SELL order placement
   - Partial and full order matching
   - Trade generation & persistence
   - In-memory order book with async trade storage
   - Thread-safe matching logic
   - Configured async executor for scalability
  ### 🔄 Real-Time Updates
   - Live order book updates via WebSockets
   - Real-time trade history streaming
   - Instant UI updates without polling
  ### 🖥️ Frontend 
   - Place BUY / SELL orders
   - Live depth chart visualization
   - Order book (bids & asks)
   - Trade history feed
   - My Orders tracking
   - Market statistics bar
---
### 🏗️ System Architecture
``` mermaid
flowchart LR

  %% ================= CLIENT =================
  subgraph Client["🌐 Frontend (React + Vite)"]
    UI["Trading UI"]
  end

  %% ================= SERVER =================
  subgraph Server["⚙️ Backend (Spring Boot)"]
    OrderController["OrderController"]
    MatchingEngine["MatchingEngineService"]
    OrderBook["OrderBook"]
    WebSocket["WebSocket Layer"]
    TradeService["TradeService"]
  end

  %% ================= DATABASE =================
  subgraph DB["🗄 PostgreSQL"]
    TradeTable[(trades)]
  end

  %% ================= FLOW =================
  UI -->|REST| OrderController
  OrderController --> MatchingEngine
  MatchingEngine --> OrderBook
  MatchingEngine --> TradeService
  TradeService --> TradeTable

  MatchingEngine --> WebSocket
  WebSocket --> UI
```
---
## 📊 Data Model (ER Diagram)
```mermaid
erDiagram
  ORDER ||--o{ TRADE : generates

  ORDER {
    Long id
    String symbol
    Double price
    Integer quantity
    OrderType type
    OrderStatus status
    LocalDateTime timestamp
  }

  TRADE {
    Long id
    Double price
    Integer quantity
    LocalDateTime executedAt
  }
```
---
### 🔁 Order Matching Flow (Price–Time Priority)
```mermaid
sequenceDiagram
  participant Trader
  participant UI
  participant Controller
  participant Engine
  participant OrderBook
  participant DB

  Trader ->> UI: Place BUY / SELL order
  UI ->> Controller: POST /orders
  Controller ->> Engine: submitOrder()
  Engine ->> OrderBook: attemptMatch()
  OrderBook -->> Engine: matched trades
  Engine ->> DB: persist trades (async)
  Engine ->> UI: WebSocket update (order book + trades)
```
### 📸 Screenshots

---
### 🧠 Backend Project Structure
    src/main/java/com.stock_trading_engine
     ├── config
     │   ├── AsyncConfig
     │   └── WebSocketConfig
     ├── controller
     │   └── OrderController
     ├── model
     │   ├── Order
     │   ├── Trade
     │   ├── OrderType
     │   └── OrderStatus
     ├── orderbook
     │   ├── OrderBook
     │   └── OrderBookManager
     ├── service
     │   ├── MatchingEngineService
     │   └── TradeService
     └── StockTradingEngineApplication
---

