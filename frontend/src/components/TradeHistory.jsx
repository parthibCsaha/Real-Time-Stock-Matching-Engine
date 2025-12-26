import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * TradeHistory Component
 * Displays recent executed trades from the matching engine
 * Trades are saved to PostgreSQL asynchronously after matching
 */
const TradeHistory = ({ trades = [] }) => {
  // Determine if price went up or down compared to previous trade
  const getPriceDirection = (index) => {
    if (index >= trades.length - 1) return 'neutral';
    const currentPrice = parseFloat(trades[index].price);
    const prevPrice = parseFloat(trades[index + 1].price);
    if (currentPrice > prevPrice) return 'up';
    if (currentPrice < prevPrice) return 'down';
    return 'neutral';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-400" />
        Trade History
        {trades.length > 0 && (
          <span className="text-xs font-normal text-slate-500">
            ({trades.length} trades)
          </span>
        )}
      </h2>
      
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-slate-400 mb-2 px-2">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Time</span>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No trades yet</p>
            <p className="text-xs mt-1">Place matching orders to execute trades</p>
          </div>
        ) : (
          trades.map((trade, index) => {
            const direction = getPriceDirection(index);
            return (
              <div
                key={trade.id || index}
                className="bg-slate-900/50 border border-slate-700/50 rounded p-2 hover:border-slate-600 transition"
              >
                <div className="grid grid-cols-3 items-center">
                  {/* Price with direction indicator */}
                  <div className="flex items-center gap-1">
                    {direction === 'up' && (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    )}
                    {direction === 'down' && (
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`font-mono font-bold text-sm ${
                      direction === 'up' ? 'text-emerald-400' :
                      direction === 'down' ? 'text-red-400' :
                      'text-white'
                    }`}>
                      ${parseFloat(trade.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <span className="text-center text-slate-300 text-sm">
                    {trade.quantity?.toLocaleString()}
                  </span>

                  {/* Timestamp */}
                  <span className="text-right text-slate-500 text-xs">
                    {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>

                {/* Trade ID (subtle) */}
                <div className="mt-1 text-xs text-slate-600 truncate">
                  ID: {trade.id?.substring(0, 16) || 'N/A'}...
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trade Stats */}
      {trades.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Avg Price: </span>
            <span className="text-white font-mono">
              ${(trades.reduce((sum, t) => sum + parseFloat(t.price), 0) / trades.length).toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Total Vol: </span>
            <span className="text-white">
              {trades.reduce((sum, t) => sum + (t.quantity || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;