import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { PostCard } from '@/components/PostCard';
import { TrendingSidebar } from '@/components/TrendingSidebar';
import { cn } from '@/lib/utils';
import { CATEGORIES, CATEGORY_ICONS, type SortMode } from '@/lib/types';
import { motion } from 'framer-motion';

const TABS: { value: SortMode; label: string }[] = [
  { value: 'trending', label: '🔥 Trending' },
  { value: 'latest', label: '🕐 Latest' },
  { value: 'top', label: '⬆️ Top' },
];

const Index = () => {
  const { initUser, sortMode, setSortMode, getSortedPosts, selectedCategory, setSelectedCategory } = useStore();

  useEffect(() => { initUser(); }, [initUser]);

  const posts = getSortedPosts();

  return (
    <div className="flex gap-8 max-w-6xl mx-auto px-6 py-10">
      <div className="flex-1 min-w-0 space-y-8">
        <header className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold heading-display text-foreground tracking-tight"
          >
            {selectedCategory ? (
              <span className="flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-xl text-2xl">{CATEGORY_ICONS[selectedCategory]}</span>
                {selectedCategory} Feedback
              </span>
            ) : 'Campus Feed'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-muted-foreground font-medium opacity-70"
          >
            {selectedCategory ? `Showing latest ${selectedCategory.toLowerCase()} related issues and feedback` : 'Discover and discuss community feedback from your campus'}
          </motion.p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1.5 bg-muted/50 p-1.5 rounded-2xl w-fit border border-white/5">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSortMode(tab.value)}
                className={cn(
                  'px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                  sortMode === tab.value 
                    ? 'bg-card text-primary shadow-glow border border-white/5' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:hidden -mx-6 px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2.5 pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border',
                !selectedCategory 
                  ? 'bg-primary border-primary text-white shadow-glow' 
                  : 'bg-card/40 border-white/5 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  'px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border flex items-center gap-2',
                  selectedCategory === cat 
                    ? 'bg-primary border-primary text-white shadow-glow' 
                    : 'bg-card/40 border-white/5 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                )}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 glass rounded-[2.5rem] border-dashed border-2 border-white/5"
            >
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">No posts found</p>
              <p className="text-muted-foreground max-w-xs mx-auto font-medium opacity-70">
                There are no posts in this category yet. Be the first to share your thoughts!
              </p>
            </motion.div>
          ) : (
            posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          )}
        </div>
      </div>
      
      <aside className="hidden xl:block w-80 space-y-8">
        <TrendingSidebar />
      </aside>
    </div>
  );
};

export default Index;
