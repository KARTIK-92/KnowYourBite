import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ProductSearch } from './components/ProductSearch';
import { ProductDetails } from './components/ProductDetails';
import { DietPlanner } from './components/DietPlanner';
import { ProductData, UserProfile } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { searchProductByName } from './services/gemini';

// Mock initial user
const INITIAL_USER: UserProfile = {
  name: "Alex Health",
  email: "alex@example.com",
  dailyGoals: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70
  },
  history: [],
  dietPlan: []
};

export default function App() {
  const [currentView, setCurrentView] = useState<'hero' | 'search' | 'details' | 'planner'>('hero');
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateTo = (view: 'hero' | 'search' | 'details' | 'planner') => {
    setCurrentView(view);
  };

  const handleProductSelect = (product: ProductData) => {
    setSelectedProduct(product);
    navigateTo('details');
  };

  const handleDetailsSearch = async (query: string) => {
    setIsLoadingDetails(true);
    try {
      const product = await searchProductByName(query);
      setSelectedProduct(product);
    } catch (error) {
      console.error("Failed to search product details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAddToDiet = (product: ProductData) => {
    setUser(prev => ({
      ...prev,
      dietPlan: [...prev.dietPlan, { product, quantity: 1, addedAt: new Date().toISOString() }]
    }));
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={navigateTo} 
      user={user}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      <AnimatePresence mode="wait">
        {currentView === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Hero onStart={() => navigateTo('search')} />
          </motion.div>
        )}

        {currentView === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl mx-auto px-4"
          >
            <ProductSearch onProductFound={handleProductSelect} />
          </motion.div>
        )}

        {currentView === 'details' && selectedProduct && (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl mx-auto px-4"
          >
            <ProductDetails 
              product={selectedProduct} 
              onAddToDiet={handleAddToDiet}
              onBack={() => navigateTo('search')}
              onSearch={handleDetailsSearch}
              isLoading={isLoadingDetails}
            />
          </motion.div>
        )}

        {currentView === 'planner' && (
          <motion.div
            key="planner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-6xl mx-auto px-4"
          >
            <DietPlanner 
              user={user} 
              isDarkMode={isDarkMode} 
              onUpdateUser={setUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}