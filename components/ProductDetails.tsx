import React from 'react';
import { ProductData } from '../types';
import { ArrowLeft, AlertTriangle, CheckCircle2, MinusCircle, Sparkles, Zap, Flame, Droplets, Wheat, Cookie, Activity, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductDetailsProps {
  product: ProductData;
  onAddToDiet: (product: ProductData) => void;
  onBack: () => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onSearch, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
             <div className="h-24 w-24 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
             <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-emerald-500 animate-pulse" />
             </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-bold text-xl mt-8 animate-pulse tracking-tight">Deciphering Nutrition Data...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // Sort ingredients: Bad first, then Good, then Neutral (to highlight concerns)
  const sortedIngredients = [...product.ingredients].sort((a, b) => {
     const priority = { bad: 0, good: 1, neutral: 2 };
     const pA = a.status && priority[a.status] !== undefined ? priority[a.status] : 2;
     const pB = b.status && priority[b.status] !== undefined ? priority[b.status] : 2;
     return pA - pB;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-24 max-w-6xl mx-auto"
    >
      {/* Navigation */}
      <motion.div variants={itemVariants} className="flex justify-start items-center mb-6 sticky top-24 z-30 pointer-events-none">
        <button 
            onClick={onBack} 
            className="pointer-events-auto flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
        >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Search
        </button>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Identity & Summary */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            {/* Product Card */}
            <div className="holo-card rounded-[2.5rem] p-6 overflow-hidden relative group">
                <div className="aspect-square bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center p-8 relative overflow-hidden mb-6 border border-slate-100 dark:border-slate-700 shadow-inner">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <span className="text-6xl font-bold text-slate-200 dark:text-slate-700">{product.name[0]}</span>
                    )}
                </div>
                
                <div className="px-2">
                    <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3">
                        {product.category}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">{product.name}</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium font-mono">{product.brand}</p>
                </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Sparkles size={20} className="text-emerald-400 dark:text-emerald-600" />
                    <h3 className="font-bold text-lg">AI Verdict</h3>
                 </div>
                 <p className="text-slate-300 dark:text-slate-600 leading-relaxed relative z-10 font-medium">
                    "{product.healthReasoning}"
                 </p>
            </div>
        </motion.div>

        {/* Right Column: Detailed Data */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">
            
            {/* Nutrition Grid */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Nutrition Facts (per 100g)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <NutrientCard 
                        label="Calories" 
                        value={product.nutrition.calories} 
                        unit="kcal" 
                        icon={<Flame size={18} className="text-orange-500" />}
                        bgColor="bg-orange-500/10"
                        borderColor="border-orange-500/20"
                    />
                    <NutrientCard 
                        label="Protein" 
                        value={product.nutrition.protein} 
                        unit="g" 
                        icon={<Zap size={18} className="text-emerald-500" />}
                        bgColor="bg-emerald-500/10"
                        borderColor="border-emerald-500/20"
                    />
                    <NutrientCard 
                        label="Carbs" 
                        value={product.nutrition.carbs} 
                        unit="g" 
                        icon={<Wheat size={18} className="text-blue-500" />}
                        bgColor="bg-blue-500/10"
                        borderColor="border-blue-500/20"
                    />
                    <NutrientCard 
                        label="Fats" 
                        value={product.nutrition.fats} 
                        unit="g" 
                        icon={<Droplets size={18} className="text-yellow-500" />}
                        bgColor="bg-yellow-500/10"
                        borderColor="border-yellow-500/20"
                    />
                     <NutrientCard 
                        label="Sugar" 
                        value={product.nutrition.sugar} 
                        unit="g" 
                        icon={<Cookie size={18} className="text-pink-500" />}
                        bgColor="bg-pink-500/10"
                        borderColor="border-pink-500/20"
                    />
                    <NutrientCard 
                        label="Fiber" 
                        value={product.nutrition.fiber || 0} 
                        unit="g" 
                        icon={<Scale size={18} className="text-indigo-500" />}
                        bgColor="bg-indigo-500/10"
                        borderColor="border-indigo-500/20"
                    />
                     <NutrientCard 
                        label="Salt" 
                        value={product.nutrition.salt || 0} 
                        unit="g" 
                        icon={<Activity size={18} className="text-slate-500" />}
                        bgColor="bg-slate-500/10"
                        borderColor="border-slate-500/20"
                    />
                </div>
            </section>

            {/* Ingredients Breakdown */}
            <section>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Scale size={18} className="text-slate-400" />
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Ingredients Analysis</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {product.ingredients.length} DETECTED
                    </span>
                </div>
                
                <div className="space-y-3">
                    {sortedIngredients.map((ing, i) => (
                        <IngredientRow key={i} item={ing} />
                    ))}
                </div>
            </section>

        </motion.div>
      </div>
    </motion.div>
  );
};

// Internal Components
const NutrientCard = ({ label, value, unit, icon, bgColor, borderColor }: any) => (
    <div className={`p-4 rounded-2xl border ${borderColor} ${bgColor} flex flex-col justify-between min-h-[100px]`}>
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase opacity-60 text-slate-700 dark:text-slate-300">{label}</span>
            {icon}
        </div>
        <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
            <span className="text-xs font-bold opacity-60 ml-0.5 text-slate-700 dark:text-slate-300">{unit}</span>
        </div>
    </div>
);

const IngredientRow = ({ item }: any) => {
    const isBad = item.status === 'bad';
    const isGood = item.status === 'good';
    
    let colorClass = 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900';
    let icon = <MinusCircle size={16} className="text-slate-400" />;
    let statusText = 'Neutral';
    let statusBg = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

    if (isBad) {
        colorClass = 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10';
        icon = <AlertTriangle size={16} className="text-red-500" />;
        statusText = 'Concern';
        statusBg = 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300';
    } else if (isGood) {
        colorClass = 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10';
        icon = <CheckCircle2 size={16} className="text-emerald-500" />;
        statusText = 'Healthy';
        statusBg = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300';
    }

    return (
        <div className={`p-4 rounded-2xl border ${colorClass} transition-all`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {icon}
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wide ${statusBg}`}>
                    {statusText}
                </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed ml-7">
                {item.reason}
            </p>
        </div>
    );
};
