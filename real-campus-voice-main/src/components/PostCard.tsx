import { MessageSquare, Clock, Flag, CheckCircle2, RotateCcw, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoteControls } from './VoteControls';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import type { Post } from '@/lib/types';
import { motion } from 'framer-motion';
import { TimeAgo } from './TimeAgo';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const { currentUser, togglePostStatus, getCommentCount } = useStore();
  const isAuthor = currentUser?.id === post.userId;
  const commentCount = getCommentCount(post.id);

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Mark this issue as ${post.status === 'Resolved' ? 'Open' : 'Resolved'}?`)) {
      await togglePostStatus(post.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="hover-lift"
    >
      <Link to={`/post/${post.id}`} className="block group">
        <div className="flex gap-4 p-5 bg-card/40 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-glow transition-all border border-white/5 hover:border-primary/20 relative overflow-hidden">
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex-shrink-0 relative z-10" onClick={(e) => e.preventDefault()}>
            <VoteControls targetId={post.id} targetType="post" votesCount={post.votesCount} />
          </div>

          <div className="flex-1 min-w-0 space-y-3 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={post.category} />
              <StatusBadge status={post.status} />
              {isAuthor && (
                <button
                  onClick={handleToggleStatus}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95',
                    post.status === 'Resolved' 
                      ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-glow'
                  )}
                >
                  {post.status === 'Resolved' ? (
                    <><RotateCcw className="w-3 h-3" /> Reopen</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" /> Mark Resolved</>
                  )}
                </button>
              )}
              <span className="text-[10px] font-medium text-muted-foreground ml-auto flex items-center gap-1 opacity-60">
                <Clock className="w-3 h-3" /> <TimeAgo date={post.createdAt} />
              </span>
            </div>

            <h3 className="text-lg font-bold heading-display text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {post.description}
            </p>

            {post.imageUrl && (
              <div className="w-full h-48 rounded-xl overflow-hidden bg-muted relative group-hover:shadow-glow transition-shadow">
                <img 
                  src={post.imageUrl} 
                  alt="Post attachment" 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
            )}

            {post.adminResponse && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs shadow-inner">
                <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-tighter">
                  <Shield className="w-3 h-3" /> Admin Response
                </div>
                <p className="text-card-foreground leading-relaxed opacity-90 italic">
                  "{post.adminResponse}"
                </p>
              </div>
            )}

            <div className="flex items-center gap-5 text-[11px] font-semibold text-muted-foreground pt-1 border-t border-white/5 group-hover:border-primary/10 transition-colors">
              <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" /> {commentCount} comments
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                {post.userAlias}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
