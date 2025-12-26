import { useEffect, useRef, useState } from 'react';
import wsService from '../services/websocket';

export const useWebSocket = (symbol) => {
  const [connected, setConnected] = useState(false);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ buyOrders: [], sellOrders: [] });
  const tradesSubscription = useRef(null);
  const orderBookSubscription = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect(
      () => {
        setConnected(true);
        
        // Subscribe to trades
        tradesSubscription.current = wsService.subscribeToTrades(symbol, (trade) => {
          setTrades(prev => [trade, ...prev.slice(0, 49)]);
        });

        // Subscribe to order book updates
        orderBookSubscription.current = wsService.subscribeToOrderBook(symbol, (book) => {
          setOrderBook(book);
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      }
    );

    // Cleanup on unmount
    return () => {
      if (tradesSubscription.current) {
        tradesSubscription.current.unsubscribe();
      }
      if (orderBookSubscription.current) {
        orderBookSubscription.current.unsubscribe();
      }
    };
  }, [symbol]);

  return { connected, trades, orderBook };
};
