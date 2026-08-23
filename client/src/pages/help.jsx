import { useState, useEffect } from 'react';
import { Search, ChevronDown, Rocket, ShoppingBag, RotateCcw, CreditCard, Shield, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import LoadingState from '../components/states/LoadingState';
import ErrorState from '../components/states/ErrorState';

const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case 'Getting Started': return <Rocket className="w-5 h-5" />;
    case 'Shopping & Orders': return <ShoppingBag className="w-5 h-5" />;
    case 'Returns & Refunds': return <RotateCcw className="w-5 h-5" />;
    case 'Payments': return <CreditCard className="w-5 h-5" />;
    case 'Account & Security': return <Shield className="w-5 h-5" />;
    default: return <HelpCircle className="w-5 h-5" />;
  }
};

const Help = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/faqs');
      const rawFaqs = res.data.data || [];
      
      // Group FAQs by category
      const grouped = rawFaqs.reduce((acc, faq) => {
        if (!acc[faq.category]) {
          acc[faq.category] = {
            name: faq.category,
            icon: getCategoryIcon(faq.category),
            faqs: []
          };
        }
        acc[faq.category].faqs.push(faq);
        return acc;
      }, {});

      const formattedCategories = Object.values(grouped);
      setCategories(formattedCategories);
    } catch (err) {
      console.error(err);
      console.error(err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading Help Center..." />;
  if (error) return <ErrorState message={error} onRetry={fetchFaqs} />;

  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">
      <section className="py-20 border-b border-border bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black mb-6">How can we help?</h1>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black shadow-sm text-sm transition-all"
            />
          </div>
        </div>
      </section>

      <section className="py-16 flex-grow">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Categories</h3>
                <nav className="space-y-1">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCategory(index)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === index ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <p className="px-3 text-sm text-gray-500">No categories found.</p>
                  )}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-3/4">
              <h2 className="text-2xl font-bold mb-8 text-black tracking-tight">
                {categories[activeCategory]?.name || 'FAQs'}
              </h2>
              
              <div className="space-y-4">
                {categories[activeCategory]?.faqs.map((faq, index) => {
                  const isExpanded = expandedFaq === `${activeCategory}-${index}`;
                  // Simple search filter
                  if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return null;
                  }
                  
                  return (
                    <div key={faq._id || index} className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-200">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : `${activeCategory}-${index}`)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                      >
                        <span className="font-medium text-black text-sm">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-5 pt-1 text-sm text-gray-500 leading-relaxed border-t border-border">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
                {categories[activeCategory]?.faqs.length === 0 && (
                  <p className="text-gray-500">No FAQs available in this category.</p>
                )}
              </div>

              <div className="mt-12 p-8 border border-border rounded-xl bg-gray-50 text-center">
                <h3 className="text-lg font-semibold text-black mb-2">Still need help?</h3>
                <p className="text-gray-500 text-sm mb-6">Our team is available to assist you with any questions.</p>
                <Link to="/contact" className="px-6 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;