import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import Pagination from './Pagination';

const AdminFAQsTab = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    isActive: true,
    order: 0
  });

  const categories = [
    'Getting Started',
    'Shopping & Orders',
    'Returns & Refunds',
    'Payments',
    'Account & Security',
    'Other'
  ];

  // Debounce search & filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaqs(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchFaqs(page);
  }, [page]);

  const fetchFaqs = async (currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/faqs?page=${currentPage}&limit=10&search=${searchTerm}&category=${categoryFilter}`);
      setFaqs(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (error) {
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: faq.isActive,
        order: faq.order
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        category: categories[0],
        isActive: true,
        order: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq._id}`, formData);
        toast.success('FAQ updated successfully');
      } else {
        await api.post('/faqs', formData);
        toast.success('FAQ created successfully');
      }
      handleCloseModal();
      fetchFaqs(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success('FAQ deleted successfully');
      fetchFaqs(page);
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const filteredFaqs = faqs; // Filtering is handled by the backend

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">FAQ Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange bg-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading FAQs...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <tr key={faq._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-brand-black">{faq.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-1 mt-1">{faq.answer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {faq.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(faq)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No FAQs found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-brand-black">
                {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-black">
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="faq-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-orange/50 outline-none"
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-orange/50 outline-none"
                    placeholder="E.g., How do I reset my password?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">Answer</label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-orange/50 outline-none resize-none"
                    placeholder="Provide a clear, helpful answer..."
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-brand-black mb-1">Display Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-orange/50 outline-none"
                    />
                  </div>
                  <div className="flex-1 flex items-center mt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange"
                      />
                      <span className="ml-2 text-sm text-brand-black">Active (Visible)</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-black font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="faq-form"
                className="px-6 py-2 bg-brand-orange text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingFaq ? 'Update FAQ' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQsTab;
