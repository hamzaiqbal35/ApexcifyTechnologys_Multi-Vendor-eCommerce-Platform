import { Wrench } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <Wrench className="w-24 h-24 text-blue-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-black text-black mb-4 tracking-tighter">We'll be back soon!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Sorry for the inconvenience but we're performing some maintenance at the moment. We'll be back online shortly!
        </p>
        <p className="text-sm text-gray-400">— The Fluxmart Team</p>
      </div>
    </div>
  );
};

export default Maintenance;
