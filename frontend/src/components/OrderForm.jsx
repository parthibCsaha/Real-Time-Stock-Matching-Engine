import React, { useState, useEffect } from 'react';
import { Send, TrendingUp, TrendingDown } from 'lucide-react';
import { orderAPI } from '../services/api';

/**
 * OrderForm Component
 * Allows users to submit limit orders (BUY/SELL)
 * Sends orders to POST /api/orders endpoint
 */
const OrderForm = ({ symbol, userId, lastPrice = 0, onOrderSubmitted }) => {
  const [formData, setFormData] = useState({
    type: 'BUY',
    price: '',
    quantity: '100'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Update price when lastPrice changes (for convenience)
  useEffect(() => {
    if (lastPrice > 0 && !formData.price) {
      setFormData(prev => ({ ...prev, price: lastPrice.toFixed(2) }));
    }
  }, [lastPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate inputs
      const price = parseFloat(formData.price);
      const quantity = parseInt(formData.quantity);

      if (isNaN(price) || price <= 0) {
        throw new Error('Invalid price');
      }
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity');
      }

      const orderData = {
        symbol,
        type: formData.type,
        price,
        quantity,
        userId
      };

      console.log('Submitting order:', orderData);
      const response = await orderAPI.submitOrder(orderData);
      
      setMessage({
        type: 'success',
        text: `${formData.type} order placed! ID: ${response.orderId?.substring(0, 8) || 'N/A'}...`
      });
      
      if (onOrderSubmitted) {
        onOrderSubmitted({
          ...response,
          type: formData.type,
          price,
          quantity
        });
      }

      // Reset quantity for next order
      setFormData(prev => ({ ...prev, quantity: '100' }));

    } catch (error) {
      console.error('Order error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to submit order'
      });
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Quick price buttons
  const adjustPrice = (delta) => {
    const current = parseFloat(formData.price) || lastPrice || 100;
    setFormData(prev => ({ ...prev, price: (current + delta).toFixed(2) }));
  };

  // Quick quantity buttons
  const setQuantity = (qty) => {
    setFormData(prev => ({ ...prev, quantity: qty.toString() }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        {formData.type === 'BUY' ? (
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-400" />
        )}
        Place Limit Order
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symbol Display */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Symbol</label>
          <div className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono font-bold">
            {symbol}
          </div>
        </div>

        {/* Order Type Toggle */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Order Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'BUY'})}
              className={`py-3 rounded font-bold transition flex items-center justify-center gap-2 ${
                formData.type === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              BUY
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'SELL'})}
              className={`py-3 rounded font-bold transition flex items-center justify-center gap-2 ${
                formData.type === 'SELL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              SELL
            </button>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Limit Price ($)</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => adjustPrice(-1)}
              className="px-3 bg-slate-700 hover:bg-slate-600 rounded transition"
            >
              -1
            </button>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono text-center focus:border-emerald-500 focus:outline-none"
              placeholder="0.00"
              required
            />
            <button
              type="button"
              onClick={() => adjustPrice(1)}
              className="px-3 bg-slate-700 hover:bg-slate-600 rounded transition"
            >
              +1
            </button>
          </div>
          {lastPrice > 0 && (
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, price: lastPrice.toFixed(2) }))}
              className="text-xs text-slate-500 hover:text-emerald-400 mt-1 transition"
            >
              Use last price: ${lastPrice.toFixed(2)}
            </button>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
            required
          />
          <div className="flex gap-1 mt-1">
            {[10, 50, 100, 500, 1000].map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition"
              >
                {qty}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-900 rounded p-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">Total Value:</span>
            <span className="font-mono font-bold">
              ${((parseFloat(formData.price) || 0) * (parseInt(formData.quantity) || 0)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">User ID:</span>
            <span className="font-mono text-slate-400">{userId?.substring(0, 12)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-bold py-3 rounded transition disabled:opacity-50 flex items-center justify-center gap-2 ${
            formData.type === 'BUY'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
              : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white'
          }`}
        >
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Place {formData.type} Order
            </>
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
              : 'bg-red-900/50 text-red-200 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderForm;