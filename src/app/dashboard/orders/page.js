'use client';

import React, { useState, useEffect } from 'react';
import { api, getStoredUser } from '@/lib/api';

export default function OrdersPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.list();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setError('Could not retrieve purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getStoredUser());
    fetchOrders();
  }, []);

  const openDetailModal = async (orderId) => {
    try {
      setShowDetailModal(true);
      setModalLoading(true);
      setActionError('');
      const orderData = await api.orders.get(orderId);
      setSelectedOrder(orderData);
    } catch (err) {
      setActionError('Could not load purchase order details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedOrder) return;
    
    let confirmMsg = `Are you sure you want to change this order status to '${status}'?`;
    if (status === 'Completed') {
      confirmMsg = 'Marking as Completed will decrement the manufacturer stock and increment your own inventory by the ordered quantities. Confirm stock receipt?';
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setModalLoading(true);
      setActionError('');
      const updated = await api.orders.updateStatus(selectedOrder._id, status);
      setSelectedOrder(updated);
      
      // Update local orders list
      setOrders(orders.map(o => o._id === updated._id ? updated : o));
    } catch (err) {
      setActionError(err.message || 'Failed to update order status.');
    } finally {
      setModalLoading(false);
    }
  };

  const isDistributor = user?.role === 'Distributor';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {isDistributor ? 'Purchase Orders' : 'Incoming Purchase Orders'}
        </h1>
        <p className="text-gray-400 mt-1">
          {isDistributor 
            ? 'Track your procurement orders, review approvals, and confirm stock shipments.' 
            : 'Review, authorize, and fulfill purchase orders requested by distributor partners.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Orders Grid / Table */}
      <div className="glass-card rounded-2xl border border-gray-800/40 overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-500 text-xxs font-bold uppercase tracking-wider bg-gray-900/10">
                  <th className="px-6 py-4">PO Number</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">{isDistributor ? 'Manufacturer' : 'Distributor'}</th>
                  <th className="px-6 py-4 text-center">Items Count</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {orders.map((o) => {
                  const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <tr key={o._id} className="hover:bg-gray-800/10 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white text-base">{o.poNumber}</td>
                      <td className="px-6 py-4 font-medium text-gray-400">{dateStr}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">
                          {isDistributor ? o.manufacturer?.name : o.distributor?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-300">{o.items?.length || 0}</td>
                      <td className="px-6 py-4 text-right font-bold text-white">${o.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                          o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          o.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          o.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openDetailModal(o._id)}
                          className="px-4 py-2 border border-gray-800 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-400 font-bold rounded-xl text-xs transition"
                        >
                          👁️ View details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">📝</span>
            <p className="text-gray-400 font-bold text-base">No Purchase Orders</p>
            <p className="text-xs text-gray-500 mt-2">
              {isDistributor 
                ? 'Create a procurement order using our dynamic procurement wizard.' 
                : 'Distributors have not issued any purchase orders to your organization.'}
            </p>
          </div>
        )}
      </div>

      {/* PURCHASE ORDER DETAILS MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-card rounded-2xl border border-gray-800 p-8 shadow-2xl relative animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-800/60 mb-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center space-x-2">
                  <span>Purchase Order Details</span>
                  <span className="text-indigo-400 font-mono text-sm ml-2 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedOrder?.poNumber || 'Loading...'}
                  </span>
                </h3>
                <p className="text-xxs text-gray-500 mt-0.5">
                  Issued on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Error alerts inside Modal */}
            {actionError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                ⚠️ {actionError}
              </div>
            )}

            {modalLoading && !selectedOrder ? (
              <div className="py-20 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6">
                
                {/* Meta details (Buyer & Seller) */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-900/40 border border-gray-800/40 text-xs">
                  <div>
                    <span className="block text-xxs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Distributor (Buyer)
                    </span>
                    <span className="block font-bold text-white text-sm">{selectedOrder.distributor?.name}</span>
                    <span className="block text-gray-400 mt-1">Issued By: {selectedOrder.createdBy?.name}</span>
                    <span className="block text-gray-500">{selectedOrder.createdBy?.email}</span>
                  </div>

                  <div>
                    <span className="block text-xxs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Manufacturer (Seller)
                    </span>
                    <span className="block font-bold text-white text-sm">{selectedOrder.manufacturer?.name}</span>
                    <span className="block text-gray-400 mt-1">Fulfillment Source</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</h4>
                  <div className="border border-gray-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-gray-900/60 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-800/60">
                        <tr>
                          <th className="px-4 py-2.5">SKU</th>
                          <th className="px-4 py-2.5">Item Name</th>
                          <th className="px-4 py-2.5 text-center">Quantity</th>
                          <th className="px-4 py-2.5 text-right">Unit Price</th>
                          <th className="px-4 py-2.5 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/10">
                            <td className="px-4 py-3 font-mono font-semibold text-indigo-300">{item.sku}</td>
                            <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-300">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total pricing */}
                <div className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Current Status:</span>
                    <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                      selectedOrder.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedOrder.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      selectedOrder.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total Amount:</span>
                    <span className="text-2xl font-black text-white">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons Panel */}
                <div className="pt-4 border-t border-gray-800/40 flex justify-end space-x-3">
                  
                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-3 border border-gray-800 text-gray-400 font-semibold rounded-xl text-xs hover:bg-gray-800/40 transition"
                  >
                    Close Window
                  </button>

                  {/* Manufacturer Actions: Approve or Reject */}
                  {!isDistributor && selectedOrder.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        disabled={modalLoading}
                        onClick={() => handleUpdateStatus('Rejected')}
                        className="px-5 py-3 bg-red-600/10 border border-red-500/30 text-red-300 hover:bg-red-600/20 font-bold rounded-xl text-xs transition"
                      >
                        Reject Order
                      </button>
                      <button
                        type="button"
                        disabled={modalLoading}
                        onClick={() => handleUpdateStatus('Approved')}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition glow-btn"
                      >
                        Approve Order
                      </button>
                    </>
                  )}

                  {/* Distributor Actions: Mark as Completed */}
                  {isDistributor && selectedOrder.status === 'Approved' && (
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => handleUpdateStatus('Completed')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs hover:opacity-95 transition glow-btn"
                    >
                      📦 Mark as Completed & Receive Stock
                    </button>
                  )}

                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}
    </div>
  );
}
