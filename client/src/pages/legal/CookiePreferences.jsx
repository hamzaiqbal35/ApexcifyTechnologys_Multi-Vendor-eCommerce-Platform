import LegalLayout from '../../components/LegalLayout';

const CookiePreferences = () => {
  return (
    <LegalLayout title="Cookie Preferences" lastUpdated="August 23, 2026">
      <h2>Manage Your Cookie Preferences</h2>
      <p className="mb-6">We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. You can customize your cookie preferences below.</p>
      
      <div className="space-y-6">
        <div className="border border-border p-5 rounded-xl bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-black m-0">Essential Cookies</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Always Active</span>
          </div>
          <p className="text-sm text-gray-500 m-0">These cookies are necessary for the website to function and cannot be switched off in our systems.</p>
        </div>

        <div className="border border-border p-5 rounded-xl bg-white flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-black mb-2 m-0">Analytics Cookies</h3>
            <p className="text-sm text-gray-500 max-w-2xl m-0">These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>

        <div className="border border-border p-5 rounded-xl bg-white flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-black mb-2 m-0">Marketing Cookies</h3>
            <p className="text-sm text-gray-500 max-w-2xl m-0">These cookies may be set through our site by our advertising partners to build a profile of your interests.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>

      <div className="mt-8">
        <button className="btn-primary">Save Preferences</button>
      </div>
    </LegalLayout>
  );
};

export default CookiePreferences;
