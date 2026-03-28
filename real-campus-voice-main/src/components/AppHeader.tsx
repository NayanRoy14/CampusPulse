import { Search, Moon, Sun, Plus, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpg';

export const AppHeader = () => {
  const { darkMode, toggleDarkMode, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, currentUser, logout } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileMenu(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 h-16">
          <Link to="/" className="lg:hidden flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 group">
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-glow group-hover:scale-110 transition-transform">
              <img src={logo} alt="CampusPulse" className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg" />
            </div>
            <span className="hidden sm:inline font-bold heading-display text-lg tracking-tight">Campus<span className="text-primary">Pulse</span></span>
          </Link>

          <div className="flex-1 max-w-xl mx-auto relative group min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-muted/50 hover:bg-muted/80 focus:bg-card rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode} 
              className="p-2.5 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground active:scale-90"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link 
              to="/create" 
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> New Post
            </Link>

            <button 
              onClick={() => setMobileMenu(!mobileMenu)} 
              className="lg:hidden p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl p-6 space-y-6 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <Link 
            to="/create" 
            onClick={() => setMobileMenu(false)} 
            className="flex items-center justify-center gap-3 px-6 py-4 gradient-brand text-white rounded-2xl font-bold shadow-glow sm:hidden active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" /> Create New Post
          </Link>
          
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setSelectedCategory(null); setMobileMenu(false); }} 
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent', 
                  !selectedCategory ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => { setSelectedCategory(cat); setMobileMenu(false); }} 
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent', 
                    selectedCategory === cat ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="text-lg">{CATEGORY_ICONS[cat]}</span> {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 space-y-3">
            {currentUser?.email ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground font-medium italic">
                  Logged in as {currentUser.alias}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive/10 transition-all font-semibold"
                >
                  <span className="flex items-center gap-3"><LogOut className="w-4 h-4" /> Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenu(false)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold"
              >
                <LogIn className="w-5 h-5" /> Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};
