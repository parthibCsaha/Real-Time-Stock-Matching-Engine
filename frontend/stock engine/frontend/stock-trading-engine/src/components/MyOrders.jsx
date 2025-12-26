import React from 'react';
import { ClipboardList, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * MyOrders Component
 * Shows the user's own orders with status tracking and cancellation ability
 * Matches backend Order status: PENDING, PARTIALLY_FILLED, FILLED, CANCELLED
 */
const MyOrders = ({ orders = [], onCancelOrder }) => {
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'FILLED':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'PARTIALLY_FILLED':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: // PENDING
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-blue-900/50 text-blue-300 border-blue-700',
      PARTIALLY_FILLED: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      FILLED: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
      CANCELLED: 'bg-red-900/50 text-red-300 border-red-700'
    };
    return styles[status] || styles.PENDING;
  };

  const canCancel = (status) => {
    return status === 'PENDING' || status === 'PARTIALLY_FILLED';
  };

  if (orders.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-400" />
          My Orders
        </h2>
        <div className="text-center text-slate-500 py-8">
          <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No orders placed yet</p>
          <p className="text-sm">Place an order using the form above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-blue-400" />
        My Orders
        <span className="text-sm font-normal text-slate-400">({orders.length})</span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 px-2">Time</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-right py-2 px-2">Price</th>
              <th className="text-right py-2 px-2">Qty</th>
              <th className="text-right py-2 px-2">Remaining</th>
              <th className="text-center py-2 px-2">Status</th>
              <th className="text-center py-2 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
              >
                <td className="py-2 px-2 text-slate-400 text-xs">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-2 px-2">
                  <span className={`font-bold ${
                    order.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {order.type}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-mono">
                  ${parseFloat(order.price).toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right">
                  {order.quantity}
                </td>
                <td className="py-2 px-2 text-right text-slate-400">
                  {order.remainingQuantity ?? order.quantity}
                </td>
                <td className="py-2 px-2 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-center">
                  {canCancel(order.status) && (
                    <button
                      onClick={() => onCancelOrder(order)}
                      className="p-1 hover:bg-red-900/50 rounded transition text-red-400 hover:text-red-300"
                      title="Cancel Order"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-4 gap-4 text-center text-xs">
        <div>
          <div className="text-slate-400">Pending</div>
          <div className="text-blue-400 font-bold">
            {orders.filter(o => o.status === 'PENDING').length}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Partial</div>
          <div className="text-yellow-400 font-bold">
            {orders.filter(o => o.status === 'PARTIALLY_FILLED').length}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Filled</div>
          <div className="text-emerald-400 font-bold">
            {orders.filter(o => o.status === 'FILLED').length}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Cancelled</div>
          <div className="text-red-400 font-bold">
            {orders.filter(o => o.status === 'CANCELLED').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
