import React, { useState } from 'react';
import { Leaf, Search, PieChart, User, Sun, Moon, LogOut, LogIn, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: 'hero' | 'search' | 'details' | 'planner') => void;
  user: UserProfile;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, isDarkMode, toggleTheme, onLogout, onLoginClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isGuest = user.id === 'guest';

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-500 transition-colors duration-500">
      
      {/* Floating Island Dock */}
      <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="pointer-events-auto holo-card rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        >
          {/* Logo Pill */}
          <button 
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-full text-white">
                <Leaf size={16} fill="currentColor" />
              </div>
            </div>
            <span className="font-bold tracking-tight hidden sm:block">
              KnowYour<span className="text-emerald-500">Bite</span>
            </span>
          </button>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            <NavItem 
              active={currentView === 'hero'} 
              onClick={() => onNavigate('hero')} 
              label="Home" 
              icon={<Sparkles size={18} />}
            />
            <NavItem 
              active={currentView === 'search' || currentView === 'details'} 
              onClick={() => onNavigate('search')} 
              label="Scan" 
              icon={<Search size={18} />}
            />
            <NavItem 
              active={currentView === 'planner'} 
              onClick={() => onNavigate('planner')} 
              label="Plan" 
              icon={<PieChart size={18} />}
            />
          </div>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* User Controls */}
          <div className="flex items-center gap-2 pr-1">
             <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
             >
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <div className="relative">
               <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative p-1 rounded-full group"
               >
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                     <User size={18} className="text-slate-600 dark:text-slate-300" />
                  </div>
               </button>

               <AnimatePresence>
               {showUserMenu && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(10px)" }}
                   animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                   exit={{ opacity: 0, scale: 0.9, y: 10, filter: "blur(10px)" }}
                   className="absolute right-0 mt-4 w-64 holo-card rounded-2xl overflow-hidden py-2 z-50 origin-top-right"
                 >
                   <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">{user.email}</p>
                   </div>
                   <div className="p-2">
                    {isGuest ? (
                        <button 
                            onClick={() => { setShowUserMenu(false); onLoginClick(); }}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center transition-all"
                        >
                            <LogIn size={16} className="mr-2" /> Sign In / Up
                        </button>
                    ) : (
                        <button 
                            onClick={() => { setShowUserMenu(false); onLogout(); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors font-medium"
                        >
                            <LogOut size={16} className="mr-2" /> Sign Out
                        </button>
                    )}
                   </div>
                 </motion.div>
               )}
               </AnimatePresence>
             </div>
          </div>
        </motion.nav>
      </div>

      {/* Backdrop for menu */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-24 md:pb-12 px-4 md:px-8 relative z-0 max-w-screen-2xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Dock (Only visible on small screens) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
         <div className="holo-card rounded-2xl p-2 flex justify-around items-center shadow-2xl">
             <MobileNavItem active={currentView === 'hero'} onClick={() => onNavigate('hero')} icon={<Leaf />} label="Home" />
             <MobileNavItem active={currentView === 'search' || currentView === 'details'} onClick={() => onNavigate('search')} icon={<Search />} label="Scan" />
             <MobileNavItem active={currentView === 'planner'} onClick={() => onNavigate('planner')} icon={<PieChart />} label="Plan" />
         </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
      active 
        ? 'text-white' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {active && (
      <motion.div
        layoutId="nav-pill"
        className="absolute inset-0 bg-slate-900 dark:bg-white rounded-full"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className={`relative z-10 flex items-center gap-2 mix-blend-exclusion ${active ? 'text-white dark:text-slate-900' : ''}`}>
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl w-full transition-all ${
      active ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
    }`}
  >
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] mt-1 font-bold">{label}</span>
  </button>
);