import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, PackagePlus, Save, Image as ImageIcon, Tag, FileText, DollarSign, Box, UploadCloud, ArrowLeft, ArrowRight, Trash2, PlayCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

import Pagination from './Pagination';

const AdminProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', stock: '', images: []
  });
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        // Only active categories if needed, or all categories
        setCategories(res.data.data.filter(c => c.isActive) || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with pagination and search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const fetchProducts = async (currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/products/admin/all?page=${currentPage}&limit=10&search=${searchTerm}${categoryFilter ? `&category=${categoryFilter}` : ''}`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(Number(res.data.currentPage) || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => fetchProducts(page);

  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // { type: 'deactivate'|'delete', productId, currentStatus }
  const [reasonText, setReasonText] = useState('');

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ action: 'add', quantity: 1, reason: '' });

  const filteredProducts = products; // Already filtered by backend

  const handleOpenAddModal = () => {
    setModalMode('add');
    setProductForm({ name: '', description: '', price: '', category: '', stock: '', images: [] });
    setCurrentProductId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images ? [...product.images] : []
    });
    setCurrentProductId(product._id);
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        images: productForm.images,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      };

      if (modalMode === 'add') {
        await api.post('/products', payload);
        toast.success('Product added successfully');
      } else {
        await api.put(`/products/${currentProductId}`, payload);
        toast.success('Product updated successfully');
      }
      setIsModalOpen(false);
      refreshProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (productForm.images.length + files.length > 10) {
      toast.warning('You can only upload up to 10 media files.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    setIsUploading(true);
    try {
      const { data } = await api.post('/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({ ...prev, images: [...prev.images, ...data.images] }));
      toast.success('Media uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const moveMedia = (index, direction) => {
    const newImages = [...productForm.images];
    if (direction === 'left' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    setProductForm(prev => ({ ...prev, images: newImages }));
  };

  const removeMedia = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm(prev => ({ ...prev, images: newImages }));
  };

  const handleOpenReasonModal = (type, product) => {
    setReasonAction({ type, productId: product._id, currentStatus: product.isActive });
    setReasonText('');
    setIsReasonModalOpen(true);
  };

  const handleReasonSubmit = async (e) => {
    e.preventDefault();
    if (!reasonText.trim()) {
      toast.warning('Reason is required');
      return;
    }
    
    try {
      if (reasonAction.type === 'deactivate') {
        await api.put(`/products/${reasonAction.productId}`, { 
          isActive: !reasonAction.currentStatus, 
          reason: reasonText 
        });
        toast.success(`Product ${reasonAction.currentStatus ? 'deactivated' : 'activated'} successfully`);
      } else if (reasonAction.type === 'delete') {
        await api.delete(`/products/${reasonAction.productId}`, { data: { reason: reasonText } });
        toast.success('Product deleted successfully');
      }
      setIsReasonModalOpen(false);
      refreshProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${reasonAction.type} product`);
    }
  };

  const handleOpenStockModal = (product) => {
    setStockProduct(product);
    setStockForm({ action: 'add', quantity: 1, reason: '' });
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockForm.reason.trim()) {
      toast.warning('Reason is required');
      return;
    }
    try {
      await api.put(`/products/${stockProduct._id}/stock`, stockForm);
      toast.success('Stock updated successfully');
      setIsStockModalOpen(false);
      refreshProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange bg-white text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input
              id="product-search"
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
            />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 gap-4 sm:gap-0">
              {typeof product.images?.[0] === 'string' && product.images[0].match(/\.(mp4|webm|ogg)$/i) ? (
                <div className="relative w-full sm:w-20 h-40 sm:h-20 bg-gray-100 rounded overflow-hidden">
                  <video src={getMediaUrl(product.images[0])} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 p-0.5 rounded text-white">
                    <PlayCircle size={12} />
                  </div>
                </div>
              ) : (
                <img
                  src={getMediaUrl(product.images?.[0]) || 'https://via.placeholder.com/100'}
                  alt={product.name}
                  className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded"
                />
              )}
              <div className="flex-1 w-full">
                <h4 className="font-semibold text-lg">{product.name}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="text-brand-orange font-bold">PKR {product.price}</span>
                  <span className="text-sm text-gray-600 font-medium">Stock: {product.stock}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{product.category}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap space-x-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleOpenStockModal(product)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                >
                  Manage Stock
                </button>
                <button
                  onClick={() => handleOpenEditModal(product)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleOpenReasonModal('deactivate', product)}
                  className={`px-3 py-1 rounded text-sm ${product.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  {product.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleOpenReasonModal('delete', product)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <PackagePlus size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <form id="product-form" onSubmit={handleProductSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Tag size={16} className="mr-2 text-gray-400" />
                    Product Name
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={productForm.name} 
                    onChange={e => setProductForm({...productForm, name: e.target.value})} 
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Description
                  </label>
                  <textarea 
                    required 
                    rows={4} 
                    value={productForm.description} 
                    onChange={e => setProductForm({...productForm, description: e.target.value})} 
                    placeholder="Enter detailed product description..."
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all resize-y" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <DollarSign size={16} className="mr-2 text-gray-400" />
                      Price (PKR)
                    </label>
                    <input 
                      required 
                      type="number" 
                      min="0" 
                      value={productForm.price} 
                      onChange={e => setProductForm({...productForm, price: e.target.value})} 
                      placeholder="0.00"
                      className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all font-mono" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Box size={16} className="mr-2 text-gray-400" />
                      Initial Stock
                    </label>
                    <input 
                      required 
                      type="number" 
                      min="0" 
                      value={productForm.stock} 
                      onChange={e => setProductForm({...productForm, stock: e.target.value})} 
                      placeholder="0"
                      className={`w-full border border-gray-200 p-3 rounded-xl transition-all font-mono ${modalMode === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange'}`}
                      disabled={modalMode === 'edit'} 
                    />
                    {modalMode === 'edit' && (
                      <p className="text-xs text-brand-orange font-medium mt-1 ml-1">Use 'Manage Stock' button to adjust inventory</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Tag size={16} className="mr-2 text-gray-400" />
                    Category
                  </label>
                  <select 
                    required 
                    value={productForm.category} 
                    onChange={e => setProductForm({...productForm, category: e.target.value})} 
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all appearance-none" 
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <ImageIcon size={16} className="mr-2 text-gray-400" />
                    Product Media (Images & Videos)
                  </label>
                  
                  {/* Media Uploader Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*"
                      ref={fileInputRef}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      {isUploading ? (
                        <Loader2 size={40} className="text-brand-orange animate-spin" />
                      ) : (
                        <UploadCloud size={40} className="text-gray-400" />
                      )}
                      <div className="text-sm text-gray-600">
                        {isUploading ? 'Uploading...' : 'Click or drag media here to upload'}
                      </div>
                      <div className="text-xs text-gray-400">Supports JPG, PNG, MP4, WebM (Max 50MB per file, up to 10 files)</div>
                    </div>
                  </div>

                  {/* Media Previews */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {productForm.images.map((url, index) => {
                        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                        const mediaSrc = getMediaUrl(url);
                        return (
                          <div key={`${url}-${index}`} className="relative group bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square">
                            {isVideo ? (
                              <video src={mediaSrc} className="w-full h-full object-cover" />
                            ) : (
                              <img src={mediaSrc} alt={`Media ${index}`} className="w-full h-full object-cover" />
                            )}
                            
                            {/* Video Badge */}
                            {isVideo && (
                              <div className="absolute top-2 left-2 bg-black/60 p-1 rounded text-white backdrop-blur-sm">
                                <PlayCircle size={16} />
                              </div>
                            )}
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-end">
                                <button 
                                  type="button"
                                  onClick={() => removeMedia(index)}
                                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                  title="Remove Media"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="flex justify-center space-x-2">
                                <button 
                                  type="button"
                                  onClick={() => moveMedia(index, 'left')}
                                  disabled={index === 0}
                                  className="p-1.5 bg-white text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 shadow-md"
                                  title="Move Left"
                                >
                                  <ArrowLeft size={14} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => moveMedia(index, 'right')}
                                  disabled={index === productForm.images.length - 1}
                                  className="p-1.5 bg-white text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 shadow-md"
                                  title="Move Right"
                                >
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Order Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white text-xs font-bold backdrop-blur-sm">
                              {index + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="product-form"
                className="flex items-center px-6 py-2.5 bg-brand-orange text-white font-medium rounded-xl hover:bg-brand-orange/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <Save size={18} className="mr-2" />
                {modalMode === 'add' ? 'Save Product' : 'Update Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {isReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-2">
              {reasonAction.type === 'delete' ? 'Delete Product' : (reasonAction.currentStatus ? 'Deactivate Product' : 'Activate Product')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for this action.</p>
            <form onSubmit={handleReasonSubmit}>
              <textarea required rows={3} value={reasonText} onChange={e => setReasonText(e.target.value)} placeholder="Reason..." className="w-full border p-2 rounded mb-4" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsReasonModalOpen(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                <button type="submit" className={`px-4 py-2 text-white rounded ${reasonAction.type === 'delete' ? 'bg-red-600' : 'bg-brand-orange'}`}>
                  Confirm {reasonAction.type === 'delete' ? 'Delete' : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Manage Stock: {stockProduct?.name}</h3>
            <div className="mb-4 text-sm text-gray-600">Current Stock: <span className="font-bold">{stockProduct?.stock}</span></div>
            <form onSubmit={handleStockSubmit}>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input type="radio" checked={stockForm.action === 'add'} onChange={() => setStockForm({...stockForm, action: 'add'})} className="mr-2" /> Add
                </label>
                <label className="flex items-center">
                  <input type="radio" checked={stockForm.action === 'remove'} onChange={() => setStockForm({...stockForm, action: 'remove'})} className="mr-2" /> Remove
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input required type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea required rows={2} value={stockForm.reason} onChange={e => setStockForm({...stockForm, reason: e.target.value})} placeholder="e.g. New shipment, Damaged goods..." className="w-full border p-2 rounded" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsTab;
