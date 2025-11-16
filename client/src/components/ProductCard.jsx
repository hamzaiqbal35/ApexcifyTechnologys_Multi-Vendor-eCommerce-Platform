import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPricePKR } from '../utils/currency';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product._id, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <div className="aspect-w-1 aspect-h-1 bg-gray-200">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-blue-600">{formatPricePKR(product.price)}</span>
          {product.averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm">{product.averageRating}</span>
              <span className="ml-1 text-sm text-gray-500">({product.numReviews})</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

