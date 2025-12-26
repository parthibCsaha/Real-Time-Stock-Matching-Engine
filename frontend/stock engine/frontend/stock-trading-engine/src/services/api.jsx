import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderAPI = {
  // Submit new order
  submitOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (symbol, orderId) => {
    const response = await api.delete(`/orders/${symbol}/${orderId}`);
    return response.data;
  },

  // Get order book snapshot
  getOrderBook: async (symbol) => {
    const response = await api.get(`/orderbook/${symbol}`);
    return response.data;
  },

  // Get recent trades
  getRecentTrades: async (symbol, limit = 50) => {
    const response = await api.get(`/trades/${symbol}`, {
      params: { limit }
    });
    return response.data;
  },
};

export default api;