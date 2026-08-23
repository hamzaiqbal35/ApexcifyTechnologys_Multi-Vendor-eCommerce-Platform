import { Link, useLocation } from 'react-router-dom';

const legalLinks = [
  { path: '/legal/privacy-policy', label: 'Privacy Policy' },
  { path: '/legal/terms-of-service', label: 'Terms of Service' },
  { path: '/legal/cookie-policy', label: 'Cookie Policy' },
  { path: '/legal/refund-policy', label: 'Refund Policy' },
  { path: '/legal/cancellation-policy', label: 'Cancellation Policy' },
  { path: '/legal/shipping-policy', label: 'Shipping Policy' },
  { path: '/legal/return-policy', label: 'Return / Exchange Policy' },
  { path: '/legal/disclaimer', label: 'Disclaimer' },
  { path: '/legal/accessibility', label: 'Accessibility Statement' },
  { path: '/legal/data-processing', label: 'Data Processing Agreement' },
  { path: '/legal/acceptable-use', label: 'Acceptable Use Policy' },
  { path: '/legal/security', label: 'Security Policy' },
  { path: '/legal/responsible-disclosure', label: 'Responsible Disclosure' },
  { path: '/legal/community-guidelines', label: 'Community Guidelines' },
  { path: '/legal/cookie-preferences', label: 'Cookie Preferences' },
];

const LegalLayout = ({ children, title, lastUpdated }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 lg:py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Legal Documents</h3>
              <nav className="space-y-1">
                {legalLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl border border-border p-8 lg:p-12 shadow-sm">
              <div className="mb-10 border-b border-border pb-8">
                <h1 className="text-3xl font-bold text-black mb-4 tracking-tight">{title}</h1>
                {lastUpdated && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastUpdated}
                  </p>
                )}
              </div>
              <div className="prose prose-gray max-w-none prose-headings:text-black prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                {children}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
