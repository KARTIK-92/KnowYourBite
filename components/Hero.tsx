import React from 'react';
import { ArrowRight, ScanLine, ShieldCheck, Activity, Search, Sparkles, Zap, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-visible">
      
      <div className="w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Typography & CTA */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
               <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Powered by Gemini 2.5 Flash
               </span>
            </div>
            
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.95]">
              <span className="block hover:text-emerald-500 transition-colors duration-500 cursor-default">Decode.</span>
              <span className="block text-slate-400 dark:text-slate-600 relative">
                Analyze.
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 opacity-0 hover:opacity-100 transition-opacity duration-500">Analyze.</span>
              </span>
              <span className="block text-slate-900 dark:text-white">Eat Better.</span>
            </h1>
            
            <p className="mt-2 text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl font-medium">
              Turn your camera into a nutritionist. Instantly reveal hidden ingredients and find healthier alternatives.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
              <button 
                onClick={onStart}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-300 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] focus:outline-none"
              >
                <span className="relative flex items-center">
                  Start Scanning
                  <div className="ml-3 p-1 bg-white/20 dark:bg-black/10 rounded-full">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </span>
              </button>
            </div>
          </motion.div>

          {/* Right: Levitating Composition */}
          <div className="lg:col-span-5 relative h-[600px] hidden lg:block perspective-[2000px]">
             <motion.div 
               initial={{ opacity: 0, rotateX: 20, rotateY: -20, scale: 0.8 }}
               animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1 }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="relative w-full h-full transform-style-3d"
             >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full"></div>

                {/* Main Card (Center) */}
                <motion.div 
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-10 right-10 bottom-10 holo-card rounded-[3rem] p-8 z-20 flex flex-col justify-between overflow-hidden group"
                >
                   {/* Card Content */}
                   <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Detected</div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">Avocado<br/>Toast</h3>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                         <span className="font-black text-xl">A+</span>
                      </div>
                   </div>

                   {/* Image Container */}
                   <div className="relative flex-1 my-6 rounded-[2rem] overflow-hidden">
                       <img 
                        src="https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=800&auto=format&fit=crop" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Food" 
                       />
                       {/* Scanning Line */}
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent w-full h-[20%] animate-scan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>

                   {/* Stats Row */}
                   <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center backdrop-blur-md">
                         <div className="text-[10px] uppercase font-bold text-slate-400">Cal</div>
                         <div className="font-bold text-slate-900 dark:text-white">320</div>
                      </div>
                      <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center backdrop-blur-md">
                         <div className="text-[10px] uppercase font-bold text-slate-400">Pro</div>
                         <div className="font-bold text-slate-900 dark:text-white">12g</div>
                      </div>
                      <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-3 text-center backdrop-blur-md">
                         <div className="text-[10px] uppercase font-bold text-slate-400">Fib</div>
                         <div className="font-bold text-slate-900 dark:text-white">8g</div>
                      </div>
                   </div>
                </motion.div>

                {/* Floating Widget 1 (Top Right) */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [-15, 15, -15] }}
                    transition={{ delay: 0.5, duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 -right-8 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl border border-white/10 w-48 z-30"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold uppercase text-slate-400">AI Analysis</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "92%" }}
                            transition={{ delay: 1, duration: 1.5 }}
                            className="h-full bg-emerald-500"
                        ></motion.div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold">
                        <span>Healthy</span>
                        <span className="text-emerald-500">92%</span>
                    </div>
                </motion.div>

                {/* Floating Widget 2 (Bottom Left) */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [15, -15, 15] }}
                    transition={{ delay: 0.8, duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-8 -left-8 bg-black text-white p-5 rounded-3xl shadow-2xl border border-white/10 w-56 z-30 flex items-center gap-4"
                >
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Smartphone size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold mb-0.5">Mobile Ready</div>
                        <div className="font-bold">Scan Anywhere</div>
                    </div>
                </motion.div>

             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
