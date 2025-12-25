import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ProductSearch } from './components/ProductSearch';
import { ProductDetails } from './components/ProductDetails';
import { DietPlanner } from './components/DietPlanner';
import { Auth } from './components/Auth';
import { ProductData, UserProfile } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { searchProductByName } from './services/gemini';
import { supabase } from './services/supabase';

// Mock initial user for guest
const GUEST_USER: UserProfile = {
  id: "guest",
  name: "Guest User",
  email: "guest@example.com",
  dailyGoals: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
    fiber: 30,
    sugar: 50,
    salt: 6
  },
  history: [],
  dietPlan: []
};

// Debounce helper
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export default function App() {
  const [currentView, setCurrentView] = useState<'hero' | 'search' | 'details' | 'planner'>('hero');
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  // Debounced user state for database syncing
  const debouncedUser = useDebounce(user, 2000);

  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // 1. Initial Auth Check (Supabase)
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        // Fetch user profile from DB
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && !error) {
          setUser({
            id: profile.id,
            name: profile.full_name || 'User',
            email: profile.email || session.user.email || '',
            dailyGoals: profile.daily_goals || GUEST_USER.dailyGoals,
            history: profile.history || [],
            dietPlan: profile.diet_plan || [],
            stats: profile.stats
          });
        } else {
            // Fallback if profile missing but auth exists
             setUser({ ...GUEST_USER, id: session.user.id, email: session.user.email || '' });
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(GUEST_USER);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Sync Data to Supabase when user changes (and is auth'd)
  useEffect(() => {
    const syncToDb = async () => {
      if (isAuthenticated && user.id !== 'guest') {
        const { error } = await supabase
          .from('profiles')
          .update({
            daily_goals: user.dailyGoals,
            history: user.history,
            diet_plan: user.dietPlan,
            stats: user.stats
          })
          .eq('id', user.id);
          
        if (error) console.error("Error syncing to DB:", error);
      }
    };

    // Only sync if debounced user matches current user to prevent stale closures
    if (debouncedUser === user) {
        syncToDb();
    }
  }, [debouncedUser, isAuthenticated]);

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
    // Add to history locally, useEffect will sync it
    const newHistory = [product, ...user.history.filter(p => p.name !== product.name)].slice(0, 10);
    
    setUser(prev => ({
      ...prev,
      history: newHistory
    }));

    setSelectedProduct(product);
    navigateTo('details');
  };

  const handleDetailsSearch = async (query: string) => {
    setIsLoadingDetails(true);
    try {
      const product = await searchProductByName(query);
      handleProductSelect(product);
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
    alert(`${product.name} added to your diet plan!`);
  };

  // Auth Handlers
  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleGuest = () => {
    if (!isAuthenticated) {
        setShowAuth(false);
        return;
    }
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setShowAuth(false);
    supabase.auth.signOut();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setShowAuth(false);
    setCurrentView('hero');
  };

  if (showAuth) {
    return (
      <Auth 
        onGuest={handleGuest}
        onSuccess={() => setShowAuth(false)}
      />
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={navigateTo} 
      user={user}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
      onLoginClick={handleLoginClick}
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
            <ProductSearch 
              onProductFound={handleProductSelect} 
            />
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
