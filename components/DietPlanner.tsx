import React, { useState } from 'react';
import { UserProfile, UserStats, DailyGoals, ProductData } from '../types';
import { Flame, Sparkles, Loader2, Plus, X, Search, Settings, Save } from 'lucide-react';
import { generatePersonalizedDietPlan, searchProductByName } from '../services/gemini';
import { motion } from 'framer-motion';

interface DietPlannerProps {
  user: UserProfile;
  isDarkMode?: boolean;
  onUpdateUser: (user: React.SetStateAction<UserProfile>) => void;
}

export const DietPlanner: React.FC<DietPlannerProps> = ({ user, isDarkMode, onUpdateUser }) => {
  const [showGoalSetup, setShowGoalSetup] = useState(false);
  const [showFoodLogger, setShowFoodLogger] = useState(false);
  const [setupMode, setSetupMode] = useState<'ai' | 'manual'>('ai');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Form Data
  const [statsFormData, setStatsFormData] = useState<UserStats>({
    age: 25,
    gender: 'male',
    weight: 70,
    height: 175,
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  // Manual Form Data
  const [manualGoalsData, setManualGoalsData] = useState<DailyGoals>(user.dailyGoals);

  // Food Logging State
  const [logQuery, setLogQuery] = useState('');
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [foundFood, setFoundFood] = useState<ProductData | null>(null);
  const [intakeQuantity, setIntakeQuantity] = useState(1);
  const [intakeUnit, setIntakeUnit] = useState('serving');

  // Calculate current totals
  const currentTotals = user.dietPlan.reduce((acc, item) => {
    return {
      calories: acc.calories + (item.product.nutrition.calories * item.quantity),
      protein: acc.protein + (item.product.nutrition.protein * item.quantity),
      carbs: acc.carbs + (item.product.nutrition.carbs * item.quantity),
      fats: acc.fats + (item.product.nutrition.fats * item.quantity),
      sugar: acc.sugar + (item.product.nutrition.sugar * item.quantity),
      fiber: acc.fiber + ((item.product.nutrition.fiber || 0) * item.quantity),
      salt: acc.salt + ((item.product.nutrition.salt || 0) * item.quantity),
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0, salt: 0 });

  const caloriePercentage = Math.min(100, (currentTotals.calories / (user.dailyGoals.calories || 1)) * 100);

  const handleSetGoals = async () => {
    if (setupMode === 'ai') {
        setIsGenerating(true);
        try {
          const goals = await generatePersonalizedDietPlan(statsFormData);
          onUpdateUser(prev => ({
            ...prev,
            stats: statsFormData,
            dailyGoals: goals,
          }));
          setShowGoalSetup(false);
        } catch (error) {
          console.error("Failed to generate plan", error);
          alert("Failed to generate plan. Please try again.");
        } finally {
          setIsGenerating(false);
        }
    } else {
        onUpdateUser(prev => ({
            ...prev,
            dailyGoals: manualGoalsData
        }));
        setShowGoalSetup(false);
    }
  };

  const handleSearchFood = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!logQuery.trim()) return;
      setIsSearchingFood(true);
      setFoundFood(null);
      try {
          const product = await searchProductByName(logQuery);
          setFoundFood(product);
          setIntakeQuantity(1); // Reset default
      } catch (e) {
          console.error(e);
          alert("Could not find food.");
      } finally {
          setIsSearchingFood(false);
      }
  };

  const handleLogFood = () => {
      if (!foundFood) return;

      onUpdateUser(prev => ({
          ...prev,
          dietPlan: [...prev.dietPlan, { 
              product: foundFood, 
              quantity: Number(intakeQuantity),
              unit: intakeUnit,
              addedAt: new Date().toISOString() 
          }]
      }));

      // Reset
      setFoundFood(null);
      setLogQuery('');
      setShowFoodLogger(false);
  };

  return (
    <div className="pb-12 space-y-8">
      
      {/* Header & Goal Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily Dashboard</h1>
           <p className="text-slate-500 dark:text-slate-400">Comparing your intake against your personalized targets.</p>
        </div>
        <button 
          onClick={() => {
            setManualGoalsData(user.dailyGoals);
            setShowGoalSetup(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
           <Settings size={18} />
           <span>Adjust Plan / Goals</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
        {/* Calorie Card - Takes up full width on mobile, 1/3 on desktop */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden transition-colors h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="text-orange-500 h-5 w-5" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Calories</span>
            </div>
            <div className="flex items-baseline space-x-1 mt-4">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{Math.round(currentTotals.calories)}</span>
              <span className="text-slate-400 font-medium text-lg">/ {user.dailyGoals.calories}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">kcal consumed</p>
          </div>
          <div className="mt-8">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                style={{ width: `${caloriePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right font-medium">{Math.round(caloriePercentage)}% of daily goal</p>
          </div>
        </div>

        {/* Nutrient Progress Bars - Takes up full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Nutrient Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <NutrientBar 
                    label="Protein" 
                    current={currentTotals.protein} 
                    target={user.dailyGoals.protein} 
                    unit="g" 
                    colorClass="bg-emerald-500" 
                    bgColorClass="bg-emerald-100 dark:bg-emerald-900/30"
                />
                <NutrientBar 
                    label="Carbohydrates" 
                    current={currentTotals.carbs} 
                    target={user.dailyGoals.carbs} 
                    unit="g" 
                    colorClass="bg-blue-500" 
                    bgColorClass="bg-blue-100 dark:bg-blue-900/30"
                />
                <NutrientBar 
                    label="Fats" 
                    current={currentTotals.fats} 
                    target={user.dailyGoals.fats} 
                    unit="g" 
                    colorClass="bg-amber-500" 
                    bgColorClass="bg-amber-100 dark:bg-amber-900/30"
                />
                <NutrientBar 
                    label="Fiber" 
                    current={currentTotals.fiber} 
                    target={user.dailyGoals.fiber} 
                    unit="g" 
                    colorClass="bg-purple-500" 
                    bgColorClass="bg-purple-100 dark:bg-purple-900/30"
                />
                <NutrientBar 
                    label="Sugar" 
                    current={currentTotals.sugar} 
                    target={user.dailyGoals.sugar} 
                    unit="g" 
                    colorClass="bg-pink-500" 
                    bgColorClass="bg-pink-100 dark:bg-pink-900/30"
                />
                <NutrientBar 
                    label="Salt" 
                    current={currentTotals.salt} 
                    target={user.dailyGoals.salt} 
                    unit="g" 
                    colorClass="bg-slate-500" 
                    bgColorClass="bg-slate-200 dark:bg-slate-700"
                />
            </div>
        </div>
      </div>

      {/* Intake List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
             <h3 className="font-bold text-slate-900 dark:text-white">Today's Intake Log</h3>
             <span className="text-sm text-slate-500 dark:text-slate-400">Tracked Items: {user.dietPlan.length}</span>
          </div>
          <button 
            onClick={() => setShowFoodLogger(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-900/20"
          >
             <Plus size={18} />
             <span>Log Food</span>
          </button>
        </div>
        
        {user.dietPlan.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
            <Utensils size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No food added yet today.</p>
            <p className="text-sm mt-1">Search for a product or enter a custom meal to calculate your nutrients.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {user.dietPlan.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg mr-4 overflow-hidden flex-shrink-0">
                  {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} className="h-full w-full object-cover" alt="" />
                  ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold">
                          {item.product.name[0]}
                      </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.product.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.quantity} x {item.unit || 'serving'}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      {Math.round(item.product.nutrition.calories * item.quantity)} kcal
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    P: {Math.round(item.product.nutrition.protein * item.quantity)}g • C: {Math.round(item.product.nutrition.carbs * item.quantity)}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Setup Modal */}
      {showGoalSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Plan Settings</h3>
            
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
                <button 
                    onClick={() => setSetupMode('ai')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${setupMode === 'ai' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    AI Auto-Calculate
                </button>
                <button 
                    onClick={() => setSetupMode('manual')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${setupMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    Manual Entry
                </button>
            </div>

            {setupMode === 'ai' ? (
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm text-indigo-700 dark:text-indigo-300 mb-4 flex items-start">
                        <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                        Enter your stats and our AI will build an optimized weekly nutrition plan for you.
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Age</label>
                      <input 
                        type="number" 
                        value={statsFormData.age}
                        onChange={(e) => setStatsFormData({...statsFormData, age: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Gender</label>
                      <select 
                        value={statsFormData.gender}
                        onChange={(e: any) => setStatsFormData({...statsFormData, gender: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={statsFormData.weight}
                        onChange={(e) => setStatsFormData({...statsFormData, weight: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Height (cm)</label>
                      <input 
                        type="number" 
                        value={statsFormData.height}
                        onChange={(e) => setStatsFormData({...statsFormData, height: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Activity</label>
                    <select 
                      value={statsFormData.activityLevel}
                      onChange={(e: any) => setStatsFormData({...statsFormData, activityLevel: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="sedentary">Sedentary (Office job)</option>
                      <option value="light">Lightly Active</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Goal</label>
                    <select 
                      value={statsFormData.goal}
                      onChange={(e: any) => setStatsFormData({...statsFormData, goal: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain_muscle">Gain Muscle</option>
                    </select>
                  </div>
                </div>
            ) : (
                <div className="space-y-4">
                     <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-sm text-orange-700 dark:text-orange-300 mb-4 flex items-start">
                        <Settings className="h-5 w-5 mr-2 flex-shrink-0" />
                        Manually set your daily nutritional targets.
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Calories (kcal)</label>
                      <input 
                        type="number" 
                        value={manualGoalsData.calories}
                        onChange={(e) => setManualGoalsData({...manualGoalsData, calories: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Protein (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.protein}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, protein: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Carbs (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.carbs}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, carbs: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Fats (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.fats}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, fats: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Fiber (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.fiber}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, fiber: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                         <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sugar (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.sugar}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, sugar: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Salt (g)</label>
                        <input 
                            type="number" 
                            value={manualGoalsData.salt}
                            onChange={(e) => setManualGoalsData({...manualGoalsData, salt: Number(e.target.value)})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowGoalSetup(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleSetGoals}
                disabled={isGenerating}
                className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg flex justify-center items-center disabled:opacity-70"
              >
                {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : (setupMode === 'ai' ? 'Generate Plan' : 'Save Goals')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Log Food Modal */}
      {showFoodLogger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800"
          >
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Log Intake</h3>
               <button onClick={() => setShowFoodLogger(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X size={24} />
               </button>
            </div>

            <div className="space-y-6">
                {/* Search / Entry */}
                <form onSubmit={handleSearchFood} className="relative">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">1. Find Food</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={logQuery}
                            onChange={(e) => setLogQuery(e.target.value)}
                            placeholder="e.g. Banana, Chicken Breast"
                            className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                        />
                        <button 
                            type="submit"
                            disabled={isSearchingFood || !logQuery}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl disabled:opacity-50"
                        >
                            {isSearchingFood ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </button>
                    </div>
                </form>

                {/* Calculation Stage */}
                {foundFood && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-4 mb-4">
                             <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                {foundFood.imageUrl && !foundFood.imageUrl.includes('placehold') ? (
                                    <img src={foundFood.imageUrl} className="h-full w-full object-cover" alt="" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                        <Utensils size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{foundFood.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{foundFood.brand}</p>
                                <div className="flex gap-3 mt-1 text-xs text-slate-600 dark:text-slate-300">
                                    <span>{foundFood.nutrition.calories} kcal</span>
                                    <span>P: {foundFood.nutrition.protein}g</span>
                                    <span>C: {foundFood.nutrition.carbs}g</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">2. Quantity</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0.1"
                                    value={intakeQuantity}
                                    onChange={(e) => setIntakeQuantity(Number(e.target.value))}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Unit</label>
                                <select 
                                    value={intakeUnit}
                                    onChange={(e) => setIntakeUnit(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="serving">Serving(s)</option>
                                    <option value="gram">Grams (x100g base)</option>
                                    <option value="oz">Ounces</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Total: {Math.round(foundFood.nutrition.calories * intakeQuantity)} kcal
                            </span>
                             <button 
                                onClick={handleLogFood}
                                className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle size={16} />
                                <span>Log Intake</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

// Helper components
const NutrientBar = ({ label, current, target, unit, colorClass, bgColorClass }: any) => {
    const percentage = Math.min(100, (current / (target || 1)) * 100);
    const roundedCurrent = Math.round(current);
    
    return (
        <div className="mb-2">
            <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{label}</span>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-slate-900 dark:text-white font-bold">{roundedCurrent}{unit}</span> 
                    <span className="mx-1">/</span> 
                    {target}{unit}
                </div>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden ${bgColorClass}`}>
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const Utensils = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);
const CheckCircle = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);