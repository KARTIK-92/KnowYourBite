import React from 'react';
import { ProductData } from '../types';
import { ArrowLeft, Check, X, AlertTriangle, Heart, Plus, Sparkles, ChevronRight, Loader2, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProductDetailsProps {
  product: ProductData;
  onAddToDiet: (product: ProductData) => void;
  onBack: () => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToDiet, onBack, onSearch, isLoading }) => {
  const nutritionData = [
    { name: 'Protein', value: product.nutrition.protein, color: '#10b981' }, // emerald
    { name: 'Carbs', value: product.nutrition.carbs, color: '#3b82f6' }, // blue
    { name: 'Fats', value: product.nutrition.fats, color: '#f59e0b' }, // amber
    { name: 'Sugar', value: product.nutrition.sugar, color: '#ef4444' } // red
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">Loading better choice...</p>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
        <ArrowLeft className="h-5 w-5 mr-1" /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Analysis */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
             <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                {product.imageUrl ? (
                   <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-slate-300 dark:text-slate-600 font-bold text-4xl">{product.name[0]}</span>
                )}
             </div>
             <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">{product.name}</h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium">{product.brand}</p>
             <span className="inline-block mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold uppercase tracking-wide">
               {product.category}
             </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors">
             <div className="flex items-center mb-3">
               <Info className="h-5 w-5 text-blue-500 mr-2" />
               <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">AI Analysis</p>
             </div>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {product.healthReasoning}
             </p>
          </div>
          
          <button 
             onClick={() => onAddToDiet(product)}
             className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
             <Plus className="h-5 w-5 mr-2" /> Add to Daily Plan
          </button>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Pros & Cons */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6">
                 <h3 className="flex items-center text-emerald-800 dark:text-emerald-300 font-bold mb-4">
                    <Check className="h-5 w-5 mr-2 bg-emerald-200 dark:bg-emerald-800 rounded-full p-1 text-emerald-700 dark:text-emerald-200" /> 
                    Why it's Good
                 </h3>
                 <ul className="space-y-3">
                    {product.pros.map((pro, i) => (
                       <li key={i} className="flex items-start text-sm text-emerald-900 dark:text-emerald-100/80">
                          <span className="mr-2">•</span> {pro}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-6">
                 <h3 className="flex items-center text-red-800 dark:text-red-300 font-bold mb-4">
                    <X className="h-5 w-5 mr-2 bg-red-200 dark:bg-red-800 rounded-full p-1 text-red-700 dark:text-red-200" /> 
                    Watch Out For
                 </h3>
                 <ul className="space-y-3">
                    {product.cons.map((con, i) => (
                       <li key={i} className="flex items-start text-sm text-red-900 dark:text-red-100/80">
                          <span className="mr-2">•</span> {con}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
           
           {/* Healthier Alternatives Section */}
           {product.healthierAlternatives && product.healthierAlternatives.length > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-200 dark:bg-indigo-800 rounded-full blur-2xl opacity-50"></div>
                <h3 className="flex items-center text-indigo-800 dark:text-indigo-300 font-bold mb-4 relative z-10">
                   <Sparkles className="h-5 w-5 mr-2 text-indigo-500" />
                   Healthier Alternatives
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                   {product.healthierAlternatives.map((alt, i) => (
                      <button 
                        key={i} 
                        onClick={() => onSearch(alt.name)}
                        className="text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                      >
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                             Alternative
                           </span>
                           <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                         </div>
                         <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{alt.name}</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{alt.brand}</p>
                         <p className="text-xs text-indigo-600 dark:text-indigo-300/80 line-clamp-2 leading-relaxed">
                           {alt.reason}
                         </p>
                      </button>
                   ))}
                </div>
              </div>
           )}

           {/* Nutrition Macros */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Nutritional Breakdown <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">(per serving)</span></h3>
              <div className="flex flex-col md:flex-row items-center">
                 <div className="h-48 w-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={nutritionData}
                             innerRadius={50}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                          >
                             {nutritionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="font-bold text-2xl text-slate-800 dark:text-white">{product.nutrition.calories}</span>
                       <span className="text-xs text-slate-400 font-medium">kcal</span>
                    </div>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-4 ml-0 md:ml-8 mt-6 md:mt-0 w-full">
                    <MacroCard label="Protein" value={`${product.nutrition.protein}g`} color="text-emerald-500" />
                    <MacroCard label="Carbs" value={`${product.nutrition.carbs}g`} color="text-blue-500" />
                    <MacroCard label="Fats" value={`${product.nutrition.fats}g`} color="text-amber-500" />
                    <MacroCard label="Sugar" value={`${product.nutrition.sugar}g`} color="text-red-500" />
                 </div>
              </div>
           </div>

           {/* Ingredient List */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Ingredients Analysis</h3>
              <div className="space-y-4">
                 {product.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                       <div className={`mt-1 mr-3 flex-shrink-0 w-3 h-3 rounded-full ${
                          ing.status === 'good' ? 'bg-emerald-500' : 
                          ing.status === 'bad' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                       }`} />
                       <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{ing.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ing.reason}</p>
                       </div>
                       <div className="ml-auto">
                          {ing.status === 'bad' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                          {ing.status === 'good' && <Heart className="h-4 w-4 text-emerald-400" />}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const MacroCard = ({ label, value, color }: any) => (
  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center transition-colors">
     <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
     <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);