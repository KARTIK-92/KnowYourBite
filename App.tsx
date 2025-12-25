import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ProductSearch } from './components/ProductSearch';
import { ProductDetails } from './components/ProductDetails';
import { DietPlanner } from './components/DietPlanner';
import { Auth } from './components/Auth';
import { ProductData, UserProfile } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { searchProductByName } from './services/gemini';

// Mock initial user for guest
const GUEST_USER: UserProfile = {
  id: "guest",
  name: "Guest User",
  email: "guest@example.com",
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
  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('kyb_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setShowAuth(false);
    } else {
      setShowAuth(true);
    }
  }, []);

  // Persist user state whenever it changes (if authenticated)
  useEffect(() => {
    if (isAuthenticated && user.id !== 'guest') {
      localStorage.setItem('kyb_current_user', JSON.stringify(user));
      // Update the user in the "database" (users array)
      const users = JSON.parse(localStorage.getItem('kyb_users') || '[]');
      const updatedUsers = users.map((u: UserProfile) => u.id === user.id ? user : u);
      localStorage.setItem('kyb_users', JSON.stringify(updatedUsers));
    }
  }, [user, isAuthenticated]);

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
    // Add to history if not already there (check by name for simplicity)
    const newHistory = [product, ...user.history.filter(p => p.name !== product.name)].slice(0, 10); // Keep last 10
    
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
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('kyb_users') || '[]');
      const foundUser = users.find((u: UserProfile) => u.email === email && u.password === password);
      
      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('kyb_current_user', JSON.stringify(foundUser));
        setShowAuth(false);
      } else {
        setAuthError("Invalid email or password");
      }
      setAuthLoading(false);
    }, 1000);
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('kyb_users') || '[]');
      if (users.find((u: UserProfile) => u.email === email)) {
        setAuthError("Email already exists");
        setAuthLoading(false);
        return;
      }

      const newUser: UserProfile = {
        ...GUEST_USER,
        id: crypto.randomUUID(),
        name,
        email,
        password,
        history: [],
        dietPlan: []
      };

      users.push(newUser);
      localStorage.setItem('kyb_users', JSON.stringify(users));
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('kyb_current_user', JSON.stringify(newUser));
      setShowAuth(false);
      setAuthLoading(false);
    }, 1000);
  };

  const handleGuest = () => {
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('kyb_current_user');
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setShowAuth(true);
    setCurrentView('hero');
  };

  if (showAuth) {
    return (
      <Auth 
        onLogin={handleLogin} 
        onSignup={handleSignup} 
        onGuest={handleGuest}
        isLoading={authLoading}
        error={authError}
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
              recentHistory={user.history}
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