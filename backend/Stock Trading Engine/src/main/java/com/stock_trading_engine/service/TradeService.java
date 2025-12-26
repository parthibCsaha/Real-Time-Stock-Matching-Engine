package com.stock_trading_engine.service;

import com.stock_trading_engine.model.Trade;
import com.stock_trading_engine.repo.TradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeService {

    private final TradeRepository tradeRepository;

    @Transactional
    public void saveTrades(List<Trade> trades) {
        tradeRepository.saveAll(trades);
        log.info("Saved {} trades to database", trades.size());
    }

    public List<Trade> getRecentTrades(String symbol, int limit) {
        return tradeRepository.findBySymbolOrderByTimestampDesc(symbol,
                org.springframework.data.domain.PageRequest.of(0, limit));
    }

}
