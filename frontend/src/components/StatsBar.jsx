import React from 'react';
import { DollarSign, Activity, TrendingUp, Zap } from 'lucide-react';

/**
 * StatsBar Component
 * Displays key trading statistics for the current symbol
 */
const StatsBar = ({ symbol, lastPrice = 0, totalTrades = 0, volume = 0 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Symbol */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-slate-400 text-sm">Symbol</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white">
          {symbol || 'N/A'}
        </div>
      </div>

      {/* Last Price */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 text-sm">Last Price</span>
        </div>
        <div className="text-2xl font-bold text-emerald-400 font-mono">
          {lastPrice > 0 ? `$${lastPrice.toFixed(2)}` : '—'}
        </div>
      </div>
      
      {/* Total Trades */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400 text-sm">Total Trades</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {totalTrades.toLocaleString()}
        </div>
      </div>
      
      {/* Volume */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400 text-sm">Volume</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {volume.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;