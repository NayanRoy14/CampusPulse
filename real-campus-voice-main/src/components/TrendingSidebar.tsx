import { useStore } from '@/lib/store';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TrendingSidebar = () => {
  const { posts } = useStore();
  const trending = [...posts].sort((a, b) => b.votesCount - a.votesCount).slice(0, 5);
  const alerts = posts.filter((p) => p.sentimentScore < -0.6 && p.status === 'Open');

  return (
    <div className="space-y-6 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="glass p-6 rounded-[2rem] shadow-soft border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-colors" />
        
        <h3 className="font-bold heading-display flex items-center gap-3 mb-6 text-foreground text-lg">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          Trending Topics
        </h3>
        
        <div className="space-y-5">
          {trending.map((p, i) => (
            <Link key={p.id} to={`/post/${p.id}`} className="flex items-start gap-4 group/item">
              <span className="text-2xl font-black text-muted-foreground/10 group-hover/item:text-primary/20 transition-colors mt-[-4px]">
                0{i + 1}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold leading-snug line-clamp-2 group-hover/item:text-primary transition-colors text-foreground">
                  {p.title}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  <span className="flex items-center gap-1">🔥 {p.votesCount}</span>
                  <span className="flex items-center gap-1">💬 {p.commentsCount}</span>
                </div>
              </div>
            </Link>
          ))}
          {trending.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 font-medium italic opacity-60">
              No trending posts yet...
            </p>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive/5 backdrop-blur-md border border-destructive/20 rounded-[2rem] p-6 shadow-glow shadow-destructive/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 blur-2xl -mr-12 -mt-12" />
          
          <h3 className="font-bold heading-display flex items-center gap-3 mb-5 text-destructive text-lg">
            <div className="p-2 bg-destructive/10 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            Critical Alerts
          </h3>
          
          <div className="space-y-4">
            {alerts.slice(0, 3).map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="block group/alert">
                <p className="text-sm font-bold line-clamp-1 text-foreground group-hover/alert:text-destructive transition-colors">
                  {p.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  <span className="px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">{p.category}</span>
                  <span>Sentiment: {p.sentimentScore.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
