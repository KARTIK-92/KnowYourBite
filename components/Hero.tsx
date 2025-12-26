import React from 'react';
import { ArrowRight, ScanLine, ShieldCheck, Activity, Search, Sparkles, Zap, Smartphone, ChevronDown, Camera, Utensils, RefreshCw, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full flex flex-col">
      
      {/* --- HERO MAIN SECTION --- */}
      <div className="min-h-[90vh] flex flex-col items-center justify-center relative pb-20">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="w-full z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Typography & CTA */}
            <motion.div
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left pt-12 lg:pt-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-emerald-500/30 backdrop-blur-md mb-8 shadow-sm"
              >
                 <Sparkles className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                 <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    AI-Powered Nutrition Lens
                 </span>
              </motion.div>
              
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1]">
                Your food, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 relative">
                  decoded.
                </span>
              </h1>
              
              <p className="mt-2 text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg font-medium">
                Don't guess what's in your meal. Scan it. Analyze it. Eat smarter with Gemini AI.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={onStart}
                  className="group relative w-full sm:w-64 inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-300 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-white hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 focus:outline-none overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center">
                    Start Analysis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button 
                  onClick={scrollToFeatures}
                  className="px-8 py-5 text-slate-500 dark:text-slate-400 font-bold hover:text-emerald-600 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  How it works
                </button>
              </div>
            </motion.div>

            {/* Right: Interactive 3D Card */}
            <div className="lg:col-span-5 relative h-[500px] lg:h-[600px] perspective-[2000px] flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                 animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 className="relative w-full max-w-md"
               >
                  {/* Floating Blob Behind */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-400/30 to-blue-400/30 blur-[60px] rounded-full animate-pulse-slow"></div>

                  {/* Main App Preview Card */}
                  <motion.div 
                      animate={{ y: [-15, 15, -15] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-[2.5rem] p-6 shadow-2xl z-20"
                  >
                     {/* Card Header */}
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                              <ScanLine size={24} />
                           </div>
                           <div>
                              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Scanning...</div>
                              <div className="font-bold text-lg text-slate-900 dark:text-white leading-none">Matcha Latte</div>
                           </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                           A Grade
                        </div>
                     </div>

                     {/* Image Simulation */}
                     <div className="h-56 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative mb-6 group">
                        <img 
                           src="https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=600" 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                           alt="Matcha"
                        />
                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 bg-emerald-900/20">
                            <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] animate-scan absolute top-0"></div>
                        </div>
                        {/* Tags on Image */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                           <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">High Antioxidants</span>
                        </div>
                     </div>

                     {/* Data Rows */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                           <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Natural Caffeine</span>
                           </div>
                           <span className="text-xs font-mono text-slate-400">45mg</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                           <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Added Cane Sugar</span>
                           </div>
                           <span className="text-xs font-mono text-slate-400">12g</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div 
                     initial={{ x: -20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 1, duration: 1 }}
                     className="absolute -bottom-6 -right-6 z-30 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                  >
                     <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <BrainCircuit size={18} className="text-blue-600 dark:text-blue-400" />
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">AI Insight</div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Good source of energy</div>
                     </div>
                  </motion.div>
               </motion.div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors"
          onClick={scrollToFeatures}
        >
          <ChevronDown size={32} />
        </motion.div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div id="features-section" className="w-full py-24 relative z-10">
         <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
                <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-emerald-500 font-bold tracking-widest uppercase text-sm"
                >
                    Why KnowYourBite?
                </motion.span>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 mb-6"
                >
                   Your Pocket <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Nutritionist.</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
                >
                   We combine powerful computer vision with the Gemini 2.5 AI model to break down food labels, analyze meals, and help you reach your goals.
                </motion.p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                   delay={0.1}
                   icon={<Camera size={28} className="text-white" />}
                   gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                   title="Instant Scan"
                   desc="Point your camera at any food product or barcode. Our AI vision identifies it in milliseconds."
                />
                <FeatureCard 
                   delay={0.2}
                   icon={<ShieldCheck size={28} className="text-white" />}
                   gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                   title="Ingredient Truth"
                   desc="No more confusion. We highlight harmful additives and translate complex chemical names into plain English."
                />
                <FeatureCard 
                   delay={0.3}
                   icon={<RefreshCw size={28} className="text-white" />}
                   gradient="bg-gradient-to-br from-orange-500 to-pink-600"
                   title="Smart Swaps"
                   desc="Found something unhealthy? We automatically suggest tastier, nutrient-rich alternatives."
                />
                <FeatureCard 
                   delay={0.4}
                   icon={<Utensils size={28} className="text-white" />}
                   gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                   title="Voice Logging"
                   desc="Simply say 'I had 2 eggs and toast'. We calculate the calories and macros for you instantly."
                />
             </div>
             
             {/* Bottom Call to Action */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mt-24 holo-card rounded-[3rem] p-12 text-center relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-xl"></div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">Ready to transform your diet?</h3>
                <button 
                   onClick={onStart}
                   className="relative z-10 inline-flex items-center px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
                >
                   Start Your Health Journey <ArrowRight className="ml-2" />
                </button>
             </motion.div>
         </div>
      </div>

    </div>
  );
};

const FeatureCard = ({ icon, gradient, title, desc, delay }: any) => (
   <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 group"
   >
      <div className={`h-16 w-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
         {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
         {desc}
      </p>
   </motion.div>
);
