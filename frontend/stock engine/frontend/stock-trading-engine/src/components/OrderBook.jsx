import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * OrderBook Component
 * Displays the limit order book with buy (bid) and sell (ask) orders
 * Uses PriorityQueue data from backend:
 * - buyOrders: Max-Heap (highest price first)
 * - sellOrders: Min-Heap (lowest price first)
 */
const OrderBook = ({ orderBook = {} }) => {
  const sellOrders = orderBook.sellOrders || [];
  const buyOrders = orderBook.buyOrders || [];

  // Aggregate orders by price level for cleaner display
  const aggregatedData = useMemo(() => {
    // Aggregate sells by price
    const sellLevels = {};
    sellOrders.forEach(order => {
      const price = parseFloat(order.price).toFixed(2);
      if (!sellLevels[price]) {
        sellLevels[price] = { price: parseFloat(price), quantity: 0, orders: 0 };
      }
      sellLevels[price].quantity += order.remainingQuantity || 0;
      sellLevels[price].orders += 1;
    });

    // Aggregate buys by price
    const buyLevels = {};
    buyOrders.forEach(order => {
      const price = parseFloat(order.price).toFixed(2);
      if (!buyLevels[price]) {
        buyLevels[price] = { price: parseFloat(price), quantity: 0, orders: 0 };
      }
      buyLevels[price].quantity += order.remainingQuantity || 0;
      buyLevels[price].orders += 1;
    });

    const sells = Object.values(sellLevels).sort((a, b) => a.price - b.price);
    const buys = Object.values(buyLevels).sort((a, b) => b.price - a.price);

    // Find max quantity for bar scaling
    const allQuantities = [...sells, ...buys].map(l => l.quantity);
    const maxQuantity = Math.max(...allQuantities, 1);

    return { sells, buys, maxQuantity };
  }, [sellOrders, buyOrders]);

  const { sells, buys, maxQuantity } = aggregatedData;

  // Calculate spread
  const bestAsk = sells[0]?.price;
  const bestBid = buys[0]?.price;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : '0.00';
  const midPrice = bestAsk && bestBid ? ((bestAsk + bestBid) / 2).toFixed(2) : '0.00';

  // Calculate total depth
  const totalBidDepth = buys.reduce((sum, l) => sum + l.quantity, 0);
  const totalAskDepth = sells.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-400" />
        Order Book
        <span className="text-xs font-normal text-slate-500">({orderBook.symbol || 'N/A'})</span>
      </h2>

      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-slate-400 mb-2 px-2">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Orders</span>
      </div>
      
      {/* Sell Orders (Asks) - Lowest at bottom, closest to spread */}
      <div className="mb-2">
        <div className="text-xs text-red-400 mb-1 flex justify-between px-2">
          <span>ASKS</span>
          <span className="text-slate-500">Depth: {totalAskDepth.toLocaleString()}</span>
        </div>
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {sells.length === 0 ? (
            <div className="text-center text-slate-600 text-xs py-4">No sell orders</div>
          ) : (
            sells.slice(0, 10).reverse().map((level, idx) => (
              <div key={`sell-${idx}`} className="relative group">
                <div
                  className="absolute right-0 top-0 h-full bg-red-500/20"
                  style={{ width: `${(level.quantity / maxQuantity) * 100}%` }}
                />
                <div className="relative grid grid-cols-3 text-xs py-1 px-2 hover:bg-red-900/20 transition cursor-pointer">
                  <span className="text-red-400 font-mono font-semibold">
                    ${level.price.toFixed(2)}
                  </span>
                  <span className="text-center text-slate-300">
                    {level.quantity.toLocaleString()}
                  </span>
                  <span className="text-right text-slate-500">
                    {level.orders}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spread Indicator */}
      <div className="border-y border-slate-600 py-2 mb-2 bg-slate-900/50">
        <div className="flex justify-between items-center px-2">
          <div className="text-xs">
            <span className="text-slate-400">Spread: </span>
            <span className="text-yellow-400 font-bold">${spread}</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Mid: </span>
            <span className="text-white font-mono">${midPrice}</span>
          </div>
        </div>
      </div>

      {/* Buy Orders (Bids) - Highest at top, closest to spread */}
      <div>
        <div className="text-xs text-emerald-400 mb-1 flex justify-between px-2">
          <span>BIDS</span>
          <span className="text-slate-500">Depth: {totalBidDepth.toLocaleString()}</span>
        </div>
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {buys.length === 0 ? (
            <div className="text-center text-slate-600 text-xs py-4">No buy orders</div>
          ) : (
            buys.slice(0, 10).map((level, idx) => (
              <div key={`buy-${idx}`} className="relative group">
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500/20"
                  style={{ width: `${(level.quantity / maxQuantity) * 100}%` }}
                />
                <div className="relative grid grid-cols-3 text-xs py-1 px-2 hover:bg-emerald-900/20 transition cursor-pointer">
                  <span className="text-emerald-400 font-mono font-semibold">
                    ${level.price.toFixed(2)}
                  </span>
                  <span className="text-center text-slate-300">
                    {level.quantity.toLocaleString()}
                  </span>
                  <span className="text-right text-slate-500">
                    {level.orders}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Imbalance Indicator */}
      {totalBidDepth > 0 || totalAskDepth > 0 ? (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Order Imbalance</div>
          <div className="flex h-2 rounded overflow-hidden">
            <div 
              className="bg-emerald-500 transition-all"
              style={{ width: `${(totalBidDepth / (totalBidDepth + totalAskDepth)) * 100}%` }}
            />
            <div 
              className="bg-red-500 transition-all"
              style={{ width: `${(totalAskDepth / (totalBidDepth + totalAskDepth)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-emerald-400">{((totalBidDepth / (totalBidDepth + totalAskDepth)) * 100).toFixed(1)}%</span>
            <span className="text-red-400">{((totalAskDepth / (totalBidDepth + totalAskDepth)) * 100).toFixed(1)}%</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderBook;