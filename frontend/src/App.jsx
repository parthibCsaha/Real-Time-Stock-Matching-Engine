import React, { useState, useEffect } from 'react';
import { Activity, Plus, X, Wifi, WifiOff } from 'lucide-react';
import StatsBar from './components/StatsBar';
import OrderForm from './components/OrderForm';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import DepthChart from './components/DepthChart';
import MyOrders from './components/MyOrders';
import { orderAPI } from './services/api';

function App() {
  const [symbols, setSymbols] = useState(['AAPL', 'GOOG']);
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [newSymbol, setNewSymbol] = useState('');
  const [restConnected, setRestConnected] = useState(false);
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [symbolData, setSymbolData] = useState({});
  const [myOrders, setMyOrders] = useState([]);

  const addSymbol = () => {
    const sym = newSymbol.toUpperCase().trim();
    if (sym && !symbols.includes(sym)) {
      setSymbols([...symbols, sym]);
      setActiveSymbol(sym);
      setNewSymbol('');
    }
  };

  const removeSymbol = (sym) => {
    if (symbols.length > 1) {
      const newSymbols = symbols.filter(s => s !== sym);
      setSymbols(newSymbols);
      if (activeSymbol === sym) {
        setActiveSymbol(newSymbols[0]);
      }
      const newData = { ...symbolData };
      delete newData[sym];
      setSymbolData(newData);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const dataPromises = symbols.map(async (symbol) => {
          try {
            const [bookData, trades] = await Promise.all([
              orderAPI.getOrderBook(symbol),
              orderAPI.getRecentTrades(symbol, 50)
            ]);
            return {
              symbol,
              orderBook: bookData || { symbol, buyOrders: [], sellOrders: [] },
              trades: trades || [],
              stats: trades && trades.length > 0 ? {
                lastPrice: parseFloat(trades[0].price),
                totalTrades: trades.length,
                volume: trades.reduce((sum, t) => sum + t.quantity, 0)
              } : { lastPrice: 0, totalTrades: 0, volume: 0 }
            };
          } 
          catch {
            return {
              symbol,
              orderBook: { symbol, buyOrders: [], sellOrders: [] },
              trades: [],
              stats: { lastPrice: 0, totalTrades: 0, volume: 0 }
            };
          }
        });
        const results = await Promise.all(dataPromises);
        const newData = {};
        results.forEach(r => { newData[r.symbol] = r; });
        setSymbolData(newData);
        setRestConnected(true);
      } catch (error) {
        console.log('Backend not available:', error);
        setRestConnected(false);
      }
    };
    loadAllData();
    const interval = setInterval(loadAllData, 2000);
    return () => clearInterval(interval);
  }, [symbols]);

  const handleOrderSubmitted = (response) => {
    if (response && response.orderId) {
      setMyOrders(prev => [{
        id: response.orderId,
        symbol: activeSymbol,
        type: response.type,
        price: response.price,
        quantity: response.quantity,
        remainingQuantity: response.remainingQuantity,
        status: response.status || 'PENDING',
        timestamp: new Date().toISOString(),
        userId
      }, ...prev]);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      await orderAPI.cancelOrder(order.symbol, order.id);
      setMyOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'CANCELLED' } : o));
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const currentData = symbolData[activeSymbol] || {
    orderBook: { symbol: activeSymbol, buyOrders: [], sellOrders: [] },
    trades: [],
    stats: { lastPrice: 0, totalTrades: 0, volume: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-400" />
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Wall Street 
                </h1>
                <p className="text-slate-400 text-sm">Real-time Limit Order Book & Trade Execution</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                {restConnected ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
                <span className="text-xs text-slate-400">API</span>
                <div className={`w-2 h-2 rounded-full ${restConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
              <div className="text-xs text-slate-500 font-mono">ID: {userId.substring(0, 12)}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {symbols.map(sym => (
            <button
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className={`px-4 py-2 rounded-lg font-mono font-bold transition flex items-center gap-2 ${
                activeSymbol === sym
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}
            >
              {sym}
              {symbolData[sym]?.stats?.lastPrice > 0 && (
                <span className="text-xs opacity-75">${symbolData[sym].stats.lastPrice.toFixed(2)}</span>
              )}
              {symbols.length > 1 && (
                <X className="w-4 h-4 hover:text-red-400 ml-1" onClick={(e) => { e.stopPropagation(); removeSymbol(sym); }} />
              )}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
              placeholder="Add..."
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-20 text-center font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button onClick={addSymbol} className="bg-slate-700 hover:bg-emerald-600 p-2 rounded-lg transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <StatsBar symbol={activeSymbol} lastPrice={currentData.stats.lastPrice} totalTrades={currentData.stats.totalTrades} volume={currentData.stats.volume} />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          <div className="xl:col-span-1">
            <OrderForm symbol={activeSymbol} userId={userId} lastPrice={currentData.stats.lastPrice} onOrderSubmitted={handleOrderSubmitted} />
          </div>
          <div className="xl:col-span-1">
            <OrderBook orderBook={currentData.orderBook} />
          </div>
          <div className="xl:col-span-1">
            <DepthChart orderBook={currentData.orderBook} />
          </div>
          <div className="xl:col-span-1">
            <TradeHistory trades={currentData.trades} />
          </div>
        </div>

        <MyOrders orders={myOrders.filter(o => o.symbol === activeSymbol)} onCancelOrder={handleCancelOrder} />

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Powered by Java 17 + Spring Boot 3 + React</p>
        </div>
      </div>
    </div>
  );
}

export default App;
