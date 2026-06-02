'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, getStoredUser } from '@/lib/api';

export default function ProductsPage() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Forms state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 10,
    status: 'Active'
  });
  
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.products.list(search, statusFilter);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    setUser(getStoredUser());
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search Input Debounce / Change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'lowStockThreshold' 
        ? parseInt(value) || 0
        : name === 'costPrice' || name === 'sellingPrice'
        ? parseFloat(value) || 0
        : value
    });
    if (formError) setFormError('');
  };

  // Open Modals
  const openAddModal = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: 10,
      status: 'Active'
    });
    setFormError('');
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      quantity: product.quantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status
    });
    setFormError('');
    setShowEditModal(true);
  };

  // Submit CRUD Requests
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name || formData.costPrice === undefined || formData.sellingPrice === undefined) {
      setFormError('Please fill in all required fields (SKU, Name, Cost, Price).');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      await api.products.create(formData);
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to create product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name || formData.costPrice === undefined || formData.sellingPrice === undefined) {
      setFormError('Please fill in all required fields (SKU, Name, Cost, Price).');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      await api.products.update(currentProduct._id, formData);
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to update product.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await api.products.delete(id);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const isDistributor = user?.role === 'Distributor';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isDistributor ? 'My Inventory' : 'Products Catalog'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isDistributor 
              ? 'Monitor stock on hand, review threshold alerts, and manage incoming stock.' 
              : 'Add, update, and manage products inside your organization catalog.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm transition glow-btn flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search products by SKU or Name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="glass-card rounded-2xl border border-gray-800/40 overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-500 text-xxs font-bold uppercase tracking-wider bg-gray-900/10">
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-center">Qty on Hand</th>
                  <th className="px-6 py-4 text-center">Min Threshold</th>
                  <th className="px-6 py-4 text-right">Cost Price</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {products.map((p) => {
                  const isLowStock = p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p._id} className={`hover:bg-gray-800/10 transition-colors ${isLowStock ? 'bg-amber-500/[0.01]' : ''}`}>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-300">{p.sku}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="text-xxs text-gray-500 truncate max-w-xs">{p.description || 'No description'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`font-bold text-base ${isLowStock ? 'text-amber-400' : 'text-white'}`}>
                            {p.quantity}
                          </span>
                          {isLowStock && (
                            <span className="text-xxs px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold mt-1">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-500">{p.lowStockThreshold}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">${p.costPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">${p.sellingPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                          p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="h-8 w-8 rounded-lg border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            title="Delete Product"
                            className="h-8 w-8 rounded-lg border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 flex items-center justify-center text-xs transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">📦</span>
            <p className="text-gray-400 font-bold text-base">Your Catalog is Empty</p>
            <p className="text-xs text-gray-500 mt-2">Get started by creating your first product item.</p>
            <button
              onClick={openAddModal}
              className="mt-6 px-4 py-2.5 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white text-xs transition glow-btn"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-gray-800 p-8 shadow-2xl relative animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">📦 Add Product to Catalog</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    SKU (Unique) *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="SKU-1001"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Copper Tubing"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. High quality copper piping for refrigeration systems..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Min Alert Qty
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-800 rounded-xl hover:bg-gray-800/40 text-gray-400 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition glow-btn flex items-center justify-center space-x-2"
                >
                  {formLoading ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-gray-800 p-8 shadow-2xl relative animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">✏️ Edit Catalog Product</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    SKU (Unique) *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                    placeholder="SKU-1001"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Copper Tubing"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Tubing description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Quantity on Hand
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Min Alert Qty
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={handleFormChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border border-gray-800 rounded-xl hover:bg-gray-800/40 text-gray-400 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition glow-btn flex items-center justify-center space-x-2"
                >
                  {formLoading ? 'Saving...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
