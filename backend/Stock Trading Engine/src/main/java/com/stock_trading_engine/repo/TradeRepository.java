package com.stock_trading_engine.repo;

import com.stock_trading_engine.model.Trade;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, String> {

    // Fixed: removed "Top" - Pageable handles the limit
    List<Trade> findBySymbolOrderByTimestampDesc(String symbol, Pageable pageable);
}