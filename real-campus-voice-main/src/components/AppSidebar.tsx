import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_ICONS, type Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Plus, Shield, LogIn, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.jpg';

export const AppSidebar = () => {
  const { selectedCategory, setSelectedCategory, isAdmin, currentUser, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 glass border-r border-white/5 h-screen fixed left-0 top-0 overflow-y-auto overscroll-contain z-30 custom-scrollbar">
      <Link to="/" className="flex items-center gap-3.5 px-7 py-8 border-b border-white/5 group">
        <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-glow group-hover:rotate-6 transition-transform">
          <img src={logo} alt="CampusPulse" className="w-7 h-7 rounded-lg" />
        </div>
        <span className="font-bold text-xl heading-display tracking-tight text-foreground">
          Campus<span className="text-primary">Pulse</span>
        </span>
      </Link>

      <nav className="px-4 py-6 space-y-2">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group',
            location.pathname === '/' ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <LayoutDashboard className={cn("w-4 h-4 transition-transform group-hover:scale-110", location.pathname === '/' ? "text-primary" : "")} /> Feed
        </Link>
        <Link
          to="/create"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold gradient-brand text-white shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> New Post
        </Link>
      </nav>

      <div className="px-4 space-y-4">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          Categories
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all border border-transparent',
              !selectedCategory ? 'bg-primary/10 text-primary border-primary/10' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                'w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all border border-transparent',
                selectedCategory === cat ? 'bg-primary/10 text-primary border-primary/10' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 space-y-2">
        {currentUser?.email ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout ({currentUser.alias})
          </button>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          >
            <LogIn className="w-4 h-4" /> Login / Sign Up
          </Link>
        )}
        <Link
          to={isAdmin ? '/admin' : '/admin/login'}
          className={cn(
            "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
            location.pathname.startsWith('/admin') ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
          )}
        >
          <Shield className="w-4 h-4" /> {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
        </Link>
      </div>
    </aside>
  );
};
