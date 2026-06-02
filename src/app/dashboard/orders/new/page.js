'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewOrderPage() {
  const router = useRouter();
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState('');
  
  // Cart state: map of product ID -> quantity
  const [cart, setCart] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoadingManufacturers(true);
        const data = await api.analytics.manufacturers();
        setManufacturers(data);
      } catch (err) {
        console.error('Error fetching manufacturers:', err.message);
        setError('Could not retrieve the manufacturers list.');
      } finally {
        setLoadingManufacturers(false);
      }
    };

    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (!selectedManufacturer) {
      setCatalog([]);
      setCart({});
      return;
    }

    const fetchCatalog = async () => {
      try {
        setLoadingCatalog(true);
        setCart({});
        const data = await api.products.getManufacturerProducts(selectedManufacturer);
        setCatalog(data);
      } catch (err) {
        console.error('Error fetching manufacturer products:', err.message);
        setError('Could not fetch manufacturer catalog.');
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCatalog();
  }, [selectedManufacturer]);

  const handleManufacturerChange = (e) => {
    setSelectedManufacturer(e.target.value);
    setError('');
  };

  const handleQtyChange = (productId, val) => {
    const qty = parseInt(val) || 0;
    if (qty <= 0) {
      const updatedCart = { ...cart };
      delete updatedCart[productId];
      setCart(updatedCart);
    } else {
      setCart({
        ...cart,
        [productId]: qty
      });
    }
  };

  const incrementQty = (product) => {
    const currentQty = cart[product._id] || 0;
    handleQtyChange(product._id, currentQty + 1);
  };

  const decrementQty = (product) => {
    const currentQty = cart[product._id] || 0;
    if (currentQty > 0) {
      handleQtyChange(product._id, currentQty - 1);
    }
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const product = catalog.find(p => p._id === productId);
      if (product) {
        return sum + product.sellingPrice * qty;
      }
      return sum;
    }, 0);
  };

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity
    }));

    if (items.length === 0) {
      setError('Please add at least one item to your purchase order.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.orders.create(selectedManufacturer, items);
      router.push('/dashboard/orders');
    } catch (err) {
      setError(err.message || 'Failed to place the purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedManufacturerDetails = manufacturers.find(m => m._id === selectedManufacturer);
  const cartItemsCount = Object.keys(cart).length;
  const orderTotal = calculateTotal();

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">🛒 Procure Products</h1>
        <p className="text-gray-400 mt-1">Select a manufacturer, build your order sheet, and submit a Purchase Order.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Step 1 & 2: Selection & Catalog Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: SELECT MANUFACTURER */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800/40">
            <label className="block text-sm font-bold text-white mb-3">
              Step 1: Choose Manufacturer Partner
            </label>
            {loadingManufacturers ? (
              <div className="py-2 flex items-center space-x-2 text-xs text-gray-500">
                <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading available manufacturers...</span>
              </div>
            ) : (
              <select
                value={selectedManufacturer}
                onChange={handleManufacturerChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm transition"
              >
                <option value="">-- Click to Select Manufacturer --</option>
                {manufacturers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* STEP 2: MANUFACTURER PRODUCTS LIST */}
          {selectedManufacturer && (
            <div className="glass-card rounded-2xl border border-gray-800/40 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-800/40 bg-gray-900/10">
                <h3 className="text-lg font-bold text-white">
                  Step 2: Browse Products ({selectedManufacturerDetails?.name})
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">Click items to add them to your procurement sheet</p>
              </div>

              {loadingCatalog ? (
                <div className="py-20 flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : catalog.length > 0 ? (
                <div className="divide-y divide-gray-800/30">
                  {catalog.map((p) => {
                    const isAdded = cart[p._id] > 0;
                    return (
                      <div key={p._id} className="p-5 flex items-center justify-between hover:bg-gray-800/10 transition-colors">
                        <div className="truncate pr-4 flex-grow">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-indigo-300 text-xs font-bold">{p.sku}</span>
                            {p.quantity === 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1 truncate">{p.name}</h4>
                          <span className="text-xxs text-gray-400 block mt-0.5 truncate max-w-md">
                            {p.description || 'No description provided'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-6 flex-shrink-0">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-white">${p.sellingPrice.toFixed(2)}</span>
                            <span className="text-xxs text-gray-500 mt-0.5">Live Stock: {p.quantity}</span>
                          </div>

                          {isAdded ? (
                            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5">
                              <button
                                onClick={() => decrementQty(p)}
                                className="h-7 w-7 text-xs font-bold hover:bg-gray-800 text-gray-400 rounded-lg transition"
                              >
                                -
                              </button>
                              <span className="px-3.5 text-xs text-white font-bold">{cart[p._id]}</span>
                              <button
                                onClick={() => incrementQty(p)}
                                className="h-7 w-7 text-xs font-bold hover:bg-gray-800 text-gray-400 rounded-lg transition"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => incrementQty(p)}
                              className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white text-indigo-300 font-bold rounded-xl text-xs transition"
                            >
                              Add to Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 text-xs">
                  This manufacturer has no active products in their catalog.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Purchase Order Summary Panel (Right Column) */}
        <div className="glass-card rounded-2xl border border-gray-800/40 p-6 flex flex-col justify-between h-fit sticky top-28">
          <div>
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
              Order Sheet Summary
            </h3>
            
            {!selectedManufacturer ? (
              <div className="text-center py-12 text-xs text-gray-500">
                Please select a manufacturer partner to begin building your order.
              </div>
            ) : cartItemsCount === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500">
                Your order is currently empty. Click &quot;Add to Order&quot; to populate items.
              </div>
            ) : (
              <div className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-1">
                {Object.entries(cart).map(([productId, qty]) => {
                  const product = catalog.find(p => p._id === productId);
                  if (!product) return null;
                  return (
                    <div key={productId} className="flex justify-between items-center py-2 border-b border-gray-800/30 text-xs">
                      <div className="truncate pr-2">
                        <span className="font-bold text-white block truncate">{product.name}</span>
                        <span className="text-xxs text-gray-500 font-mono">{product.sku}</span>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <span className="text-gray-400 font-bold">x{qty}</span>
                        <span className="font-bold text-white">${(product.sellingPrice * qty).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedManufacturer && cartItemsCount > 0 && (
            <form onSubmit={handleSubmitPO} className="pt-6 border-t border-gray-800 mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Unique Items:</span>
                  <span className="font-bold text-white">{cartItemsCount}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-gray-800/40">
                  <span>Estimated Total:</span>
                  <span className="text-xl font-black text-indigo-400">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition glow-btn flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Issuing PO...</span>
                  </span>
                ) : (
                  <span>Submit Purchase Order</span>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
