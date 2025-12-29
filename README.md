# 📈 Wall Street - Real-Time Stock Matching Engine 

[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.x-ff69b4?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

### 🚀 Project Overview

   This is a full-stack, real-time stock trading engine that simulates the core backend mechanics of a modern stock exchange. It implements a price–time priority limit order book, supports BUY/SELL orders, partial fills, trade execution,     and delivers live market updates to clients using WebSockets.This project focuses on backend system design, concurrency, and real-time data flow, rather than just CRUD operations.
   
-----------------------------------------------------------------------------------------
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
flowchart TB
    subgraph Client["🌐 Frontend (React + Vite)"]
        UI[User Interface]
        OrderForm[Order Form]
        OrderBookViz[Order Book Visualization]
        TradeHistory[Trade History]
        WSClient[WebSocket Client]
    end

    subgraph Backend["⚙️ Backend (Spring Boot)"]
        subgraph Controllers
            OrderController[OrderController<br/>REST API]
            WSConfig[WebSocketConfig<br/>STOMP Endpoint]
        end
        
        subgraph Services
            MatchingEngine[MatchingEngineService<br/>Orchestration]
            TradeService[TradeService<br/>Persistence]
        end
        
        subgraph Core["🔥 Core Matching Engine"]
            OBManager[OrderBookManager<br/>Multi-Symbol]
            OrderBook[OrderBook<br/>Single Symbol]
            PQBuy[PriorityQueue<br/>Buy Orders - Max Heap]
            PQSell[PriorityQueue<br/>Sell Orders - Min Heap]
            Lock[ReentrantLock<br/>Thread Safety]
        end
    end

    subgraph Database["🗄️ PostgreSQL"]
        TradeTable[(trades)]
    end

    UI --> OrderController
    UI <--> WSClient
    WSClient <--> WSConfig
    
    OrderController --> MatchingEngine
    WSConfig --> MatchingEngine
    
    MatchingEngine --> OBManager
    MatchingEngine --> TradeService
    
    OBManager --> OrderBook
    OrderBook --> PQBuy
    OrderBook --> PQSell
    OrderBook --> Lock
    
    TradeService --> TradeTable
    
    MatchingEngine -.->|Broadcast| WSConfig
    WSConfig -.->|Push Updates| WSClient

    style Core fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style OrderBook fill:#ffd93d,stroke:#f5a623,color:#000
    style PQBuy fill:#6bcf7f,stroke:#38a169,color:#000
    style PQSell fill:#6bcf7f,stroke:#38a169,color:#000
```
---
## 📊 Data Model (ER Diagram)
```mermaid
erDiagram
    ORDER ||--o{ TRADE : "participates_in"
    ORDER {
        String id PK
        String symbol
        OrderType type
        BigDecimal price
        Long quantity
        Long remainingQuantity
        LocalDateTime timestamp
        OrderStatus status
        String userId
    }
    
    TRADE {
        String id PK
        String symbol
        String buyOrderId FK
        String sellOrderId FK
        BigDecimal price
        Long quantity
        LocalDateTime timestamp
        String buyerId
        String sellerId
    }
    
    ORDERBOOK {
        String symbol PK
        PriorityQueue buyOrders
        PriorityQueue sellOrders
        ReentrantLock lock
        Map activeOrders
    }
```
-------------------------------------------------------
### 🔁 Order Matching Flow (Price–Time Priority)
```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant MatchingEngine
    participant OrderBook
    participant TradeService
    participant WebSocket
    participant Database

    Client->>Controller: POST /api/orders<br/>{symbol, type, price, quantity}
    Controller->>MatchingEngine: processOrder(order)
    MatchingEngine->>OrderBook: addOrder(order)
    
    activate OrderBook
    Note over OrderBook: lock.lock()
    OrderBook->>OrderBook: buyOrders.offer(order)<br/>O(log n)
    OrderBook->>OrderBook: match()
    
    loop While bestBuy >= bestSell
        OrderBook->>OrderBook: executeTrade()
        Note over OrderBook: Update quantities<br/>Create Trade object
    end
    
    Note over OrderBook: lock.unlock()
    OrderBook-->>MatchingEngine: List&lt;Trade&gt;
    deactivate OrderBook
    
    MatchingEngine->>TradeService: saveTrades(trades)<br/>@Async
    activate TradeService
    TradeService->>Database: INSERT trades
    deactivate TradeService
    
    MatchingEngine->>WebSocket: broadcast trades
    WebSocket-->>Client: Trade notifications
    
    MatchingEngine->>WebSocket: broadcast order book
    WebSocket-->>Client: Order book update
    
    MatchingEngine-->>Controller: OrderResponse
    Controller-->>Client: {orderId, status, trades}
```
------------------------------------------------------------
### 📸 Screenshots
#### Home Page
![Home Page](UI/home.png)
---------------------------------------------
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
-----------------------------------------
### 🧩 Frontend Structure
      src
       ├── components
       │   ├── DepthChart.jsx
       │   ├── OrderBook.jsx
       │   ├── OrderForm.jsx
       │   ├── TradeHistory.jsx
       │   └── StatsBar.jsx
       ├── hooks
       │   ├── useOrderBook.js
       │   └── useWebSocket.js
       ├── services
       │   ├── api.js
       │   └── websocket.js
       └── App.jsx
--------------------------------------------
### 🔌 API Endpoints
   ### Orders
   - POST /api/orders – Place a BUY / SELL limit order
   - DELETE /api/orders/{symbol}/{orderId} – Cancel an existing order
   - GET /api/orderbook/{symbol} – Get current order book snapshot for a symbol
   ### Trades
   - GET /api/trades/{symbol}?limit=50 – Get recent executed trades for a symbol
   ### WebSocket
   - /ws – WebSocket connection endpoint
   - /topic/orderbook/{symbol} – Live order book updates
   - /topic/trades/{symbol} – Live trade execution updates
------------------------------------------------------------------------------------
### ⚙️ Tech Stack
   ### Backend
   - Java 17
   - Spring Boot 3
   - Spring Web
   - Spring WebSocket
   - Spring Data JPA
   - PostgreSQL
   - Async Task Executor
   - Maven
   ### Frontend
   - React 18
   - Vite
   - Tailwind CSS
   - WebSockets
   - Axios
-----------------------------------------------------------------------------------------
