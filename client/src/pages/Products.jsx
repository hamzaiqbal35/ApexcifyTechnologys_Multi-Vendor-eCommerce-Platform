import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    page: parseInt(searchParams.get('page')) || 1
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page);
      params.append('limit', '12');

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setPagination({
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
        total: res.data.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get('/categories?isActive=true');
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
    setSearchParams({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-black">Collection</h1>
        <p className="text-gray-500 mt-2">Explore our premium selection of products.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-black" />
                <h2 className="text-sm font-semibold text-black uppercase tracking-wider">Filters</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="search-products" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      id="search-products"
                      name="search"
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Find a product..."
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category-filter" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  {loadingCategories ? (
                    <div className="w-full h-9 bg-gray-100 rounded animate-pulse"></div>
                  ) : (
                    <select
                      id="category-filter"
                      name="category"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm bg-white cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-16 space-x-4 border-t border-border pt-8">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 border border-border rounded-md hover:border-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Page {filters.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className="p-2 border border-border rounded-md hover:border-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-border rounded-xl bg-gray-50">
              <p className="text-gray-500 font-medium">No products found matching your criteria.</p>
              <button onClick={() => { setFilters({ search: '', category: '', page: 1 }); setSearchParams({}); }} className="mt-4 text-sm text-black underline underline-offset-4">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
