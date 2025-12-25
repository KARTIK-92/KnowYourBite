import React, { useState } from 'react';
import { Leaf, Search, PieChart, User, Sun, Moon, LogOut, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('hero')}>
              <div className="bg-emerald-500 p-2 rounded-lg mr-2">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                KnowYourBite
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <NavItem 
                active={currentView === 'search' || currentView === 'details'} 
                onClick={() => onNavigate('search')} 
                icon={<Search size={18} />}
                label="Scan & Search" 
              />
              <NavItem 
                active={currentView === 'planner'} 
                onClick={() => onNavigate('planner')} 
                icon={<PieChart size={18} />}
                label="Diet Planner" 
              />
            </div>

            <div className="flex items-center space-x-4">
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
               >
                 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>

               <div className="relative">
                 <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden md:flex items-center space-x-3 focus:outline-none"
                 >
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                       <span className="text-xs text-slate-400 dark:text-slate-500">{isGuest ? 'Guest' : 'Basic Plan'}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm hover:border-emerald-400 transition-colors">
                       <User size={20} className="text-slate-500 dark:text-slate-400" />
                    </div>
                 </button>

                 {showUserMenu && (
                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                     {isGuest ? (
                        <button 
                            onClick={() => { setShowUserMenu(false); onLoginClick(); }}
                            className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 flex items-center font-medium"
                        >
                            <LogIn size={16} className="mr-2" /> Sign In / Sign Up
                        </button>
                     ) : (
                        <button 
                            onClick={() => { setShowUserMenu(false); onLogout(); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center"
                        >
                            <LogOut size={16} className="mr-2" /> Sign Out
                        </button>
                     )}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-6 flex justify-between z-50">
           <MobileNavItem active={currentView === 'hero'} onClick={() => onNavigate('hero')} icon={<Leaf />} label="Home" />
           <MobileNavItem active={currentView === 'search' || currentView === 'details'} onClick={() => onNavigate('search')} icon={<Search />} label="Search" />
           <MobileNavItem active={currentView === 'planner'} onClick={() => onNavigate('planner')} icon={<PieChart />} label="Plan" />
        </div>
      </nav>

      {/* Close menu when clicking outside */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
      )}

      <main className="flex-grow pt-24 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
      active 
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-lg ${
      active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'
    }`}
  >
    {React.cloneElement(icon, { size: 24 })}
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);