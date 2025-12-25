import React, { useState, useMemo } from 'react';
import { UserProfile, DailyGoals, ProductData, DietItem } from '../types';
import { 
  Plus, Search, X, Flame, Target, Settings, Save, Trash2, 
  Utensils, Zap, ChevronRight, Edit3, Check, AlignLeft, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMeal } from '../services/gemini';

interface DietPlannerProps {
  user: UserProfile;
  isDarkMode?: boolean;
  onUpdateUser: (user: React.SetStateAction<UserProfile>) => void;
}

export const DietPlanner: React.FC<DietPlannerProps> = ({ user, isDarkMode, onUpdateUser }) => {
  // --- State ---
  const [isLogging, setIsLogging] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  
  // Logging Flow State
  const [mealDescription, setMealDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<any[] | null>(null);

  // --- Calculations ---
  const totals = useMemo(() => {
    return user.dietPlan.reduce((acc, item) => ({
      calories: acc.calories + (item.product.nutrition.calories * item.quantity),
      protein: acc.protein + (item.product.nutrition.protein * item.quantity),
      carbs: acc.carbs + (item.product.nutrition.carbs * item.quantity),
      fats: acc.fats + (item.product.nutrition.fats * item.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [user.dietPlan]);

  const progress = {
    calories: Math.min(100, (totals.calories / user.dailyGoals.calories) * 100),
    protein: Math.min(100, (totals.protein / user.dailyGoals.protein) * 100),
    carbs: Math.min(100, (totals.carbs / user.dailyGoals.carbs) * 100),
    fats: Math.min(100, (totals.fats / user.dailyGoals.fats) * 100),
  };

  // --- Handlers ---

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDescription.trim()) return;
    
    setIsAnalyzing(true);
    setAnalyzedItems(null);
    
    try {
      const result = await analyzeMeal(mealDescription);
      setAnalyzedItems(result);
    } catch (err) {
      console.error(err);
      // Could add toast here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddAll = () => {
    if (!analyzedItems) return;

    const newItems: DietItem[] = analyzedItems.map(item => {
        // Construct a partial product object from the analysis
        const product: ProductData = {
            id: crypto.randomUUID(),
            name: item.item_name,
            brand: "Logged Entry",
            category: "Meal",
            imageUrl: `https://placehold.co/400x400/10b981/ffffff?text=${encodeURIComponent(item.item_name)}`,
            healthReasoning: `Portion: ${item.portion_desc}`,
            ingredients: [],
            nutrition: item.nutrition,
            certifications: [],
            pros: [],
            cons: [],
            additives: []
        };
        
        return {
            product,
            quantity: 1, // Nutrition is already calculated for total portion
            unit: 'portion',
            addedAt: new Date().toISOString()
        };
    });

    onUpdateUser(prev => ({
      ...prev,
      dietPlan: [...newItems, ...prev.dietPlan] 
    }));

    // Reset
    setIsLogging(false);
    setMealDescription('');
    setAnalyzedItems(null);
  };

  const handleDeleteEntry = (index: number) => {
    onUpdateUser(prev => {
      const newPlan = [...prev.dietPlan];
      newPlan.splice(index, 1);
      return { ...prev, dietPlan: newPlan };
    });
  };
  
  const handleRemoveAnalyzedItem = (index: number) => {
      if (!analyzedItems) return;
      const newItems = [...analyzedItems];
      newItems.splice(index, 1);
      setAnalyzedItems(newItems.length > 0 ? newItems : null);
  };

  const handleGoalChange = (key: keyof DailyGoals, value: string) => {
    const num = parseInt(value) || 0;
    onUpdateUser(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        [key]: num
      }
    }));
  };

  // --- Renderers ---

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Nutrition <span className="text-emerald-500">Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track, Analyze, Optimize.
          </p>
        </motion.div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Settings size={16} /> Targets
          </button>
          <button 
            onClick={() => setIsLogging(true)}
            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus size={18} /> Log Food
          </button>
        </div>
      </div>

      {/* 2. Holographic Dashboard (Stats) */}
      <AnimatePresence mode="wait">
        {isEditingGoals ? (
          <GoalEditor 
            key="goals"
            goals={user.dailyGoals} 
            onChange={handleGoalChange} 
            onClose={() => setIsEditingGoals(false)} 
          />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Main Calorie Ring */}
            <div className="lg:col-span-1 md:col-span-2 holo-card rounded-[2.5rem] p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
               
               {/* Animated Ring with proper ViewBox to prevent cutting */}
               <div className="relative w-56 h-56">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                     {/* Background Circle */}
                     <circle cx="128" cy="128" r="110" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="16" fill="none" />
                     {/* Progress Circle */}
                     <motion.circle 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress.calories / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="128" cy="128" r="110" 
                        className="stroke-emerald-500" 
                        strokeWidth="16" 
                        fill="none" 
                        strokeLinecap="round"
                        strokeDasharray="1"
                        strokeDashoffset="0"
                     />
                  </svg>
                  
                  {/* Center Data */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <Flame className={`h-8 w-8 mb-2 ${progress.calories > 100 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                     <div className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                        {Math.round(totals.calories)}
                     </div>
                     <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                        / {user.dailyGoals.calories} kcal
                     </div>
                  </div>
               </div>
            </div>

            {/* Circular Macro Rings */}
            <CircularMacroCard 
              label="Protein" 
              current={totals.protein} 
              target={user.dailyGoals.protein} 
              strokeColor="stroke-indigo-500" 
              unit="g" 
              icon={<Zap size={20} className="text-indigo-500" />}
            />
            <CircularMacroCard 
              label="Carbs" 
              current={totals.carbs} 
              target={user.dailyGoals.carbs} 
              strokeColor="stroke-blue-500" 
              unit="g"
              icon={<Utensils size={20} className="text-blue-500" />}
            />
            <CircularMacroCard 
              label="Fats" 
              current={totals.fats} 
              target={user.dailyGoals.fats} 
              strokeColor="stroke-amber-500" 
              unit="g"
              icon={<Target size={20} className="text-amber-500" />}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Timeline / Log */}
      <div className="pt-4">
         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            Today's Timeline
         </h3>

         {user.dietPlan.length === 0 ? (
            <div className="holo-card rounded-3xl p-12 flex flex-col items-center justify-center text-center opacity-60">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Utensils className="h-8 w-8 text-slate-400" />
               </div>
               <p className="text-lg font-bold">No entries yet</p>
               <p className="text-sm">Log your first meal to start the engine.</p>
            </div>
         ) : (
            <div className="space-y-4 relative">
               {/* Timeline Line */}
               <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 z-0"></div>

               {user.dietPlan.map((item, idx) => (
                  <motion.div 
                     key={`${item.product.name}-${idx}`}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="relative z-10 pl-16 group"
                  >
                     {/* Timeline Dot */}
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-emerald-500 shadow-sm"></div>

                     <div className="holo-card rounded-2xl p-4 flex items-center justify-between group-hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 relative">
                              {item.product.imageUrl && !item.product.imageUrl.includes('placehold') ? (
                                 <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400 bg-emerald-500/10 text-emerald-600">{item.product.name[0]}</div>
                              )}
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.product.name}</h4>
                              <div className="flex gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                                 <span>{item.product.healthReasoning?.replace('Portion: ', '') || '1 Serving'}</span>
                                 <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
                                 <span>{new Date(item.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className="text-right hidden sm:block">
                              <div className="font-black text-slate-900 dark:text-white">{Math.round(item.product.nutrition.calories)} kcal</div>
                              <div className="text-xs text-slate-500">
                                 P: {Math.round(item.product.nutrition.protein)}g
                              </div>
                           </div>
                           <button 
                              onClick={() => handleDeleteEntry(idx)}
                              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>

      {/* 4. Logging Modal (Overlay) */}
      <AnimatePresence>
        {isLogging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsLogging(false);
            }}
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
            >
               {/* Modal Header */}
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Log Intake</h3>
                  <button onClick={() => setIsLogging(false)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:opacity-80">
                     <X size={20} />
                  </button>
               </div>

               {/* Step 1: Text Input */}
               {!analyzedItems ? (
                 <div className="p-8">
                    <form onSubmit={handleAnalyze} className="relative">
                       <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 block ml-1">Describe your meal</label>
                       <div className="relative">
                            <textarea 
                                autoFocus
                                placeholder="I had 2 scrambled eggs, 2 slices of toast with butter, and a glass of orange juice..."
                                className="w-full h-40 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl p-5 text-lg font-medium outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none leading-relaxed"
                                value={mealDescription}
                                onChange={(e) => setMealDescription(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono">
                                {mealDescription.length} chars
                            </div>
                       </div>
                       
                       <div className="mt-6">
                           <button 
                              type="submit" 
                              disabled={isAnalyzing || !mealDescription.trim()}
                              className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                           >
                              {isAnalyzing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Analyzing...
                                  </>
                              ) : (
                                  <>
                                    <Sparkles size={20} /> Analyze Meal
                                  </>
                              )}
                           </button>
                       </div>
                    </form>

                    <div className="mt-8 text-center">
                       <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto flex items-center justify-center gap-2">
                          <Zap size={14} className="text-emerald-500" />
                          <span>AI will detect portions and nutrients instantly.</span>
                       </p>
                    </div>
                 </div>
               ) : (
                 /* Step 2: Review Results */
                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30 flex flex-col">
                    <div className="p-6 space-y-4 flex-1">
                       <div className="flex items-center justify-between mb-2">
                           <h4 className="font-bold text-slate-900 dark:text-white">Found {analyzedItems.length} Items</h4>
                           <button onClick={() => setAnalyzedItems(null)} className="text-xs text-emerald-500 font-bold hover:underline">Edit Text</button>
                       </div>

                       {analyzedItems.map((item, idx) => (
                           <motion.div 
                             key={idx}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative group"
                           >
                               <button 
                                  onClick={() => handleRemoveAnalyzedItem(idx)}
                                  className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                               >
                                   <X size={14} />
                               </button>

                               <div className="flex gap-4">
                                   <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                                       {item.item_name[0]}
                                   </div>
                                   <div>
                                       <h5 className="font-bold text-slate-900 dark:text-white">{item.item_name}</h5>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.portion_desc}</p>
                                   </div>
                               </div>
                               
                               <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                                   <div className="text-center">
                                       <div className="text-[10px] uppercase font-bold text-slate-400">Cal</div>
                                       <div className="font-bold text-slate-900 dark:text-white">{item.nutrition.calories}</div>
                                   </div>
                                   <div className="text-center">
                                       <div className="text-[10px] uppercase font-bold text-slate-400">Pro</div>
                                       <div className="font-bold text-slate-900 dark:text-white">{item.nutrition.protein}</div>
                                   </div>
                                   <div className="text-center">
                                       <div className="text-[10px] uppercase font-bold text-slate-400">Carb</div>
                                       <div className="font-bold text-slate-900 dark:text-white">{item.nutrition.carbs}</div>
                                   </div>
                                   <div className="text-center">
                                       <div className="text-[10px] uppercase font-bold text-slate-400">Fat</div>
                                       <div className="font-bold text-slate-900 dark:text-white">{item.nutrition.fats}</div>
                                   </div>
                               </div>
                           </motion.div>
                       ))}
                       
                       {/* Total Summary */}
                       <div className="mt-4 p-4 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-900 flex justify-between items-center">
                           <div>
                               <div className="text-xs opacity-70 font-bold uppercase">Total Meal</div>
                               <div className="text-2xl font-black">
                                   {analyzedItems.reduce((acc, i) => acc + i.nutrition.calories, 0)} <span className="text-sm font-medium">kcal</span>
                               </div>
                           </div>
                           <div className="text-right text-xs font-mono opacity-80">
                               <div>P: {analyzedItems.reduce((acc, i) => acc + i.nutrition.protein, 0)}g</div>
                               <div>C: {analyzedItems.reduce((acc, i) => acc + i.nutrition.carbs, 0)}g</div>
                               <div>F: {analyzedItems.reduce((acc, i) => acc + i.nutrition.fats, 0)}g</div>
                           </div>
                       </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-10">
                         <button 
                            onClick={handleAddAll}
                            className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                         >
                            <Check size={20} />
                            Add to Log
                         </button>
                    </div>
                 </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- Sub-Components ---

const CircularMacroCard = ({ label, current, target, strokeColor, unit, icon }: any) => {
   const percent = Math.min(100, (current / (target || 1)) * 100);
   const radius = 35;
   const circumference = 2 * Math.PI * radius;
   
   return (
      <div className="holo-card rounded-[2.5rem] p-6 flex flex-col items-center justify-between relative overflow-hidden min-h-[200px]">
         <div className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            {icon}
         </div>
         
         <div className="text-left w-full mb-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest block mb-1">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(current)}</span>
                <span className="text-xs font-bold text-slate-400">/{target}{unit}</span>
            </div>
         </div>
         
         {/* Ring */}
         <div className="relative w-28 h-28 mt-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
               <circle cx="40" cy="40" r={radius} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="none" />
               <motion.circle 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="40" cy="40" r={radius} 
                  className={strokeColor} 
                  strokeWidth="6" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray={circumference}
               />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{Math.round(percent)}%</span>
            </div>
         </div>
      </div>
   );
};

const StatEditBox = ({ label, value, onChange, multiplier }: { label: string, value: number, onChange: (n: number) => void, multiplier: number }) => {
   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
         <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{label}</label>
         <div className="flex items-baseline gap-1">
            <input 
               type="number" 
               className="w-full bg-transparent font-mono font-bold text-xl text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-emerald-500 p-0"
               value={value}
               onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            />
            <span className="text-xs text-emerald-500 font-bold">
               x{multiplier} = {Math.round(value * multiplier)}
            </span>
         </div>
      </div>
   );
};

interface GoalEditorProps {
  goals: DailyGoals;
  onChange: (key: keyof DailyGoals, value: string) => void;
  onClose: () => void;
}

const GoalEditor: React.FC<GoalEditorProps> = ({ goals, onChange, onClose }) => {
   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="holo-card rounded-[2.5rem] p-8"
      >
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adjust Daily Targets</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
               <X size={24} />
            </button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Daily Calories</label>
               <input 
                  type="number" 
                  value={goals.calories}
                  onChange={(e) => onChange('calories', e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-3 font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500"
               />
            </div>
            {['Protein', 'Carbs', 'Fats', 'Sugar', 'Fiber', 'Salt'].map((key) => {
               const k = key.toLowerCase() as keyof DailyGoals;
               return (
                  <div key={k}>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{key} (g)</label>
                     <input 
                        type="number" 
                        value={goals[k]}
                        onChange={(e) => onChange(k, e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-3 font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                     />
                  </div>
               );
            })}
         </div>

         <div className="mt-8 flex justify-end">
            <button 
               onClick={onClose}
               className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
               <Save size={18} /> Save Changes
            </button>
         </div>
      </motion.div>
   );
};
