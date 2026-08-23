import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Pagination from './Pagination';

const AdminCategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const fetchCategories = async (currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/categories?page=${currentPage}&limit=10&search=${searchTerm}`);
      setCategories(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setPage(res.data.page || 1);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', description: '' });
      toast.success('Category added successfully');
      fetchCategories(page);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) return;

    try {
      setIsSubmitting(true);
      await api.put(`/categories/${editingCategory._id}`, {
        name: editingCategory.name,
        description: editingCategory.description,
        isActive: editingCategory.isActive
      });
      setEditingCategory(null);
      toast.success('Category updated successfully');
      fetchCategories(page);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will permanently remove the category if there are no products in it. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.delete(`/categories/${categoryId}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Category deleted successfully');
        await fetchCategories(page);
      } else {
        toast.error(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message ||
        (error.response?.status === 400
          ? 'Cannot delete category with active products. Please deactivate or move the products first.'
          : 'Failed to delete category. Please try again.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      await api.put(`/categories/${category._id}`, {
        isActive: !category.isActive
      });
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchCategories(page);
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <div className="w-full sm:w-64">
          <label htmlFor="category-search" className="sr-only">Search categories</label>
          <input
            id="category-search"
            type="search"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
          />
        </div>
      </div>

      {/* Add/Edit Category Form */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </h3>
        <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                id="category-name"
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                value={editingCategory ? editingCategory.name : newCategory.name}
                onChange={(e) =>
                  editingCategory
                    ? setEditingCategory({ ...editingCategory, name: e.target.value })
                    : setNewCategory({ ...newCategory, name: e.target.value })
                }
                required
                placeholder="Enter category name"
              />
            </div>
            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                id="category-description"
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                value={editingCategory ? editingCategory.description : newCategory.description}
                onChange={(e) =>
                  editingCategory
                    ? setEditingCategory({ ...editingCategory, description: e.target.value })
                    : setNewCategory({ ...newCategory, description: e.target.value })
                }
                placeholder="Enter description (optional)"
              />
            </div>
          </div>

          {editingCategory && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={editingCategory.isActive}
                onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                className="h-4 w-4 text-brand-orange focus:ring-brand-orange/50 border-gray-300 rounded accent-brand-orange"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-orange text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Categories</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found. Add a new category to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category._id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`font-medium ${!category.isActive ? 'text-gray-400' : 'text-gray-900'}`}>
                      {category.name}
                    </span>
                    {!category.isActive && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleCategoryStatus(category)}
                    className={`px-3 py-1 text-sm rounded-md ${category.isActive
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="px-3 py-1 text-sm text-brand-orange hover:bg-brand-orange/10 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
};

export default AdminCategoriesTab;
