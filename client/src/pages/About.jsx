import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Tag, Headphones, Award, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'E-commerce Platform',
      description: 'Discover thousands of trusted products from our premium catalog. Each product is curated for excellence.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Secure & Trusted',
      description: 'Your security is our priority. We use industry-leading encryption and security measures to protect your information.'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Enjoy quick and reliable shipping options. We are committed to getting your orders to you rapidly.'
    },
    {
      icon: <Tag className="w-8 h-8" />,
      title: 'Best Prices',
      description: 'Find competitive prices on high quality products. Our platform ensures the best deals.'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to help you with any questions or concerns.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Assured',
      description: 'We maintain high standards for all products. Every product is vetted to ensure quality and reliability.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '500K+', label: 'Products' },
    { number: '2M+', label: 'Customers' },
    { number: '150+', label: 'Countries' }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section */}
      <section className="py-24 border-b border-border bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6">About Fluxmart.</h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed">
            Building the future of e-commerce. A premium platform connecting products and consumers globally.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-4xl font-bold tracking-tighter text-black mb-1">{stat.number}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white border-b border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-black tracking-tight">Our Mission</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-6">
              At Fluxmart, we're revolutionizing the way people shop online. Our e-commerce marketplace 
              connects customers with trusted products from around the world, offering an unparalleled 
              selection at competitive prices.
            </p>
            <p>
              We believe in empowering both buyers and sellers by providing a platform that's secure, 
              user-friendly, and built on trust. Our commitment to excellence drives us to continuously 
              improve and innovate, ensuring the best possible experience for everyone in our community.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 border-b border-border">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-black tracking-tight">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-border hover:border-black transition-colors duration-300"
              >
                <div className="text-black mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-black">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Join Our Community</h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Start shopping today and experience the best e-commerce platform on the market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="btn-primary px-8 py-3 rounded-full text-base"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
