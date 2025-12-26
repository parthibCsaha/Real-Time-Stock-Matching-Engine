import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

export const useOrderBook = (symbol) => {
  const [orderBook, setOrderBook] = useState({ buyOrders: [], sellOrders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getOrderBook(symbol);
        setOrderBook(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching order book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    
    // Refresh every 5 seconds as fallback if WebSocket fails
    const interval = setInterval(fetchOrderBook, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  return { orderBook, loading, error };
};