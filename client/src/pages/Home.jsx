import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=8');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // If it's a network error, the server might not be running
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.error('Server is not running or not accessible. Make sure the backend server is running on port 5000');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl mb-8">Discover amazing products from trusted vendors</p>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No products available</div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All Products →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

