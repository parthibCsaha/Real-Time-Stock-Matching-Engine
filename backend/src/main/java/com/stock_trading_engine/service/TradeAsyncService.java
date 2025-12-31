package com.stock_trading_engine.service;

import com.stock_trading_engine.model.Trade;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TradeAsyncService {

    private final TradeService tradeService;
    private final SimpMessagingTemplate messagingTemplate;

    /*
     * Asynchronously save trades and broadcast via WebSocket
     */
    @Async("taskExecutor")
    public void processTradesAsync(List<Trade> trades) {
        try {
            // save trades to database
            tradeService.saveTrades(trades);

            for (Trade trade : trades) {
                messagingTemplate.convertAndSend("/topic/trades/" + trade.getSymbol(), trade);
                log.info("ASYNC THREAD = {}", Thread.currentThread().getName());
            }
        }
        catch (Exception e) {
            log.error("Error processing trades: {}", e.getMessage());
        }
    }


}
