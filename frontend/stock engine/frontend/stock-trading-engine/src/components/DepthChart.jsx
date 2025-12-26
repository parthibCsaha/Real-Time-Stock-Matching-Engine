import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Depth Chart Component
 * Visualizes the cumulative buy/sell volume at each price level
 * This is how traders see market liquidity - the "walls" of orders
 */
const DepthChart = ({ orderBook = {} }) => {
  const sellOrders = orderBook.sellOrders || [];
  const buyOrders = orderBook.buyOrders || [];

  // Aggregate orders by price level and calculate cumulative depth
  const depthData = useMemo(() => {
    // Aggregate buy orders (bids) - sorted high to low
    const buyLevels = {};
    buyOrders.forEach(order => {
      const price = parseFloat(order.price).toFixed(2);
      buyLevels[price] = (buyLevels[price] || 0) + (order.remainingQuantity || 0);
    });

    // Aggregate sell orders (asks) - sorted low to high  
    const sellLevels = {};
    sellOrders.forEach(order => {
      const price = parseFloat(order.price).toFixed(2);
      sellLevels[price] = (sellLevels[price] || 0) + (order.remainingQuantity || 0);
    });

    // Convert to arrays and sort
    const buys = Object.entries(buyLevels)
      .map(([price, qty]) => ({ price: parseFloat(price), quantity: qty }))
      .sort((a, b) => b.price - a.price); // Highest first

    const sells = Object.entries(sellLevels)
      .map(([price, qty]) => ({ price: parseFloat(price), quantity: qty }))
      .sort((a, b) => a.price - b.price); // Lowest first

    // Calculate cumulative depth
    let cumBuy = 0;
    const cumulativeBuys = buys.map(level => {
      cumBuy += level.quantity;
      return { ...level, cumulative: cumBuy };
    });

    let cumSell = 0;
    const cumulativeSells = sells.map(level => {
      cumSell += level.quantity;
      return { ...level, cumulative: cumSell };
    });

    // Find max cumulative for scaling
    const maxCumulative = Math.max(
      cumBuy,
      cumSell,
      1 // Prevent division by zero
    );

    return {
      buys: cumulativeBuys.slice(0, 10),
      sells: cumulativeSells.slice(0, 10),
      maxCumulative,
      totalBuyDepth: cumBuy,
      totalSellDepth: cumSell
    };
  }, [buyOrders, sellOrders]);

  // Calculate spread
  const bestBid = depthData.buys[0]?.price || 0;
  const bestAsk = depthData.sells[0]?.price || 0;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : '0.00';
  const spreadPercent = bestBid ? ((bestAsk - bestBid) / bestBid * 100).toFixed(3) : '0.000';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        Depth Chart
      </h2>

      {/* Market Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="bg-emerald-900/30 rounded p-2 text-center">
          <div className="text-slate-400">Total Bids</div>
          <div className="text-emerald-400 font-bold">{depthData.totalBuyDepth.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/50 rounded p-2 text-center">
          <div className="text-slate-400">Spread</div>
          <div className="text-yellow-400 font-bold">${spread}</div>
          <div className="text-slate-500 text-[10px]">{spreadPercent}%</div>
        </div>
        <div className="bg-red-900/30 rounded p-2 text-center">
          <div className="text-slate-400">Total Asks</div>
          <div className="text-red-400 font-bold">{depthData.totalSellDepth.toLocaleString()}</div>
        </div>
      </div>

      {/* Visual Depth Chart */}
      <div className="space-y-1">
        {/* Sell side (asks) - shown in reverse so lowest ask is at bottom */}
        <div className="text-xs text-slate-400 mb-1">ASKS (Sell Wall)</div>
        {depthData.sells.slice().reverse().map((level, idx) => (
          <div key={`sell-${idx}`} className="relative h-6">
            {/* Cumulative bar */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500/30 rounded-r"
              style={{ width: `${(level.cumulative / depthData.maxCumulative) * 100}%` }}
            />
            {/* Level bar */}
            <div
              className="absolute right-0 top-0 h-full bg-red-500/50 rounded-r"
              style={{ width: `${(level.quantity / depthData.maxCumulative) * 100}%` }}
            />
            <div className="relative flex justify-between items-center h-full px-2 text-xs">
              <span className="text-slate-300">{level.cumulative.toLocaleString()}</span>
              <span className="text-red-400 font-mono">${level.price.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {/* Spread indicator */}
        <div className="border-t border-b border-dashed border-yellow-500/50 py-1 my-2 text-center">
          <span className="text-yellow-400 text-xs font-bold">↕ ${spread} Spread</span>
        </div>

        {/* Buy side (bids) */}
        <div className="text-xs text-slate-400 mb-1">BIDS (Buy Wall)</div>
        {depthData.buys.map((level, idx) => (
          <div key={`buy-${idx}`} className="relative h-6">
            {/* Cumulative bar */}
            <div
              className="absolute left-0 top-0 h-full bg-emerald-500/30 rounded-l"
              style={{ width: `${(level.cumulative / depthData.maxCumulative) * 100}%` }}
            />
            {/* Level bar */}
            <div
              className="absolute left-0 top-0 h-full bg-emerald-500/50 rounded-l"
              style={{ width: `${(level.quantity / depthData.maxCumulative) * 100}%` }}
            />
            <div className="relative flex justify-between items-center h-full px-2 text-xs">
              <span className="text-emerald-400 font-mono">${level.price.toFixed(2)}</span>
              <span className="text-slate-300">{level.cumulative.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500/50 rounded" />
          <span>Buy Orders</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/50 rounded" />
          <span>Sell Orders</span>
        </div>
      </div>
    </div>
  );
};

export default DepthChart;
