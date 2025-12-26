import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnect, onError) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected = true;
      if (onConnect) onConnect(frame);
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket Error:', frame);
      this.connected = false;
      if (onError) onError(frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  subscribeToTrades(symbol, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/trades/${symbol}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const trade = JSON.parse(message.body);
      callback(trade);
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  subscribeToOrderBook(symbol, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/orderbook/${symbol}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const orderBook = JSON.parse(message.body);
      callback(orderBook);
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const wsService = new WebSocketService();
export default wsService;
