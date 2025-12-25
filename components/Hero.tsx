import React from 'react';
import { ArrowRight, ScanLine, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 dark:bg-emerald-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 dark:bg-teal-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 relative">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold tracking-wide mb-4">
              AI-Powered Nutrition Assistant
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Eat Smarter, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                Live Better.
              </span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Instantly analyze food products with our advanced AI scanner. Get simple health scores, uncover hidden ingredients, and track your nutrition journey.
            </p>
            
            <button 
              onClick={onStart}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 transition-all transform hover:scale-105"
            >
              Start Scanning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ScanLine className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
            title="Instant Analysis"
            desc="Snap a photo or scan a barcode to get immediate health insights and nutritional breakdowns."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
            title="Ingredient Truth"
            desc="We highlight good and bad ingredients clearly, explaining the 'why' behind every additive."
          />
          <FeatureCard 
            icon={<Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
            title="Diet Tracking"
            desc="Monitor your daily intake and visualize your progress towards your health goals effortlessly."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all"
  >
    <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);