import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { VoteControls } from '@/components/VoteControls';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, MessageSquare, Flag, Send, Clock, CheckCircle2, RotateCcw, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TimeAgo } from '@/components/TimeAgo';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, getPostComments, fetchComments, addComment, voteOnComment, reactToComment, reportContent, votes, currentUser, userReactions, togglePostStatus, getCommentCount } = useStore();
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComments(id);
    }
  }, [id, fetchComments]);

  const post = posts.find((p) => p.id === id);
  if (!post) return <div className="text-center py-20 text-muted-foreground">Post not found</div>;

  const isAuthor = currentUser?.id === post.userId;
  const commentCount = getCommentCount(post.id);

  const handleToggleStatus = async () => {
    if (confirm(`Mark this issue as ${post.status === 'Resolved' ? 'Open' : 'Resolved'}?`)) {
      await togglePostStatus(post.id);
    }
  };

  const comments = getPostComments(post.id);
  const topLevel = comments
    .filter((c) => !c.parentId)
    .sort((a, b) => b.votesCount - a.votesCount);
  const getReplies = (parentId: string) => 
    comments
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => b.votesCount - a.votesCount);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    await addComment(post.id, replyText.trim(), parentId);
    setReplyText('');
    setReplyTo(null);
  };

  const reactions = ['👍', '😡', '😂'];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all group"
      >
        <div className="p-2 rounded-xl bg-card border border-white/5 group-hover:border-primary/20 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="font-semibold">Back to Feed</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass rounded-[2.5rem] p-8 shadow-soft border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="flex gap-6 relative z-10">
          <div className="hidden sm:block">
            <VoteControls targetId={post.id} targetType="post" votesCount={post.votesCount} />
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <CategoryBadge category={post.category} />
              <StatusBadge status={post.status} />
              {isAuthor && (
                <button
                  onClick={handleToggleStatus}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-glow',
                    post.status === 'Resolved' 
                      ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  )}
                >
                  {post.status === 'Resolved' ? (
                    <><RotateCcw className="w-3.5 h-3.5" /> Reopen Issue</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved</>
                  )}
                </button>
              )}
              <span className="text-[11px] font-medium text-muted-foreground ml-auto flex items-center gap-1.5 opacity-60">
                <Clock className="w-3.5 h-3.5" /> <TimeAgo date={post.createdAt} />
              </span>
            </div>

            <h1 className="text-3xl font-bold heading-display text-foreground tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>

            {post.imageUrl && (
              <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-glow max-h-[500px] bg-muted">
                <img src={post.imageUrl} alt="Post attachment" loading="lazy" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  {post.userAlias}
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> {commentCount} comments
                </span>
              </div>
              
              <button 
                onClick={() => setShowReport(!showReport)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
              >
                <Flag className="w-4 h-4" /> Report
              </button>
            </div>

            {showReport && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2 flex-wrap pt-4"
              >
                {(['Spam', 'Abuse', 'Fake info', 'Sensitive content'] as const).map((reason) => (
                  <button key={reason} onClick={() => { reportContent(post.id, 'post', reason); setShowReport(false); }}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all border border-destructive/20">
                    {reason}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {post.adminResponse && (
          <div className="mt-8 sm:ml-16 bg-primary/5 border border-primary/20 rounded-[1.5rem] p-6 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-12 -mt-12" />
            <div className="flex items-center gap-2 mb-3 text-primary font-bold uppercase tracking-widest text-[10px]">
              <Shield className="w-4 h-4" /> Admin Response
            </div>
            <p className="text-foreground leading-relaxed italic opacity-90">
              "{post.adminResponse}"
            </p>
          </div>
        )}
      </motion.div>

      {/* Comments Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold heading-display flex items-center gap-3 text-foreground">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            Comments ({comments.length})
          </h2>
        </div>

        <div className="flex gap-3 bg-card/40 backdrop-blur-sm p-4 rounded-[1.5rem] border border-white/5 shadow-soft group">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            placeholder="Add a constructive comment..."
            className="flex-1 px-6 py-3.5 bg-muted/50 focus:bg-card rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
          />
          <button 
            onClick={submitComment} 
            disabled={!commentText.trim()}
            className={cn(
              'px-6 rounded-2xl transition-all flex items-center justify-center shadow-glow active:scale-95', 
              commentText.trim() ? 'gradient-brand text-white' : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {topLevel.length === 0 && (
            <div className="text-center py-12 opacity-50 italic text-muted-foreground">
              No comments yet. Be the first to start the conversation!
            </div>
          )}
          {topLevel.map((comment) => (
            <motion.div 
              key={comment.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-[2rem] p-6 shadow-soft border-white/5 relative group/comment"
            >
              <div className="flex gap-4">
                <div className="hidden sm:block">
                  <VoteControls targetId={comment.id} targetType="comment" votesCount={comment.votesCount} vertical={true} />
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                        {comment.userAlias.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-foreground">{comment.userAlias}</span>
                    </div>
                    <TimeAgo date={comment.createdAt} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60" />
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    {reactions.map((r) => {
                      const isReacted = userReactions.some(
                        (ur) => ur.commentId === comment.id && ur.reactionType === r
                      );
                      return (
                        <button
                          key={r}
                          onClick={() => reactToComment(comment.id, r)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-xl transition-all border font-bold flex items-center gap-1.5",
                            isReacted
                              ? "bg-primary/20 text-primary border-primary/30 shadow-glow"
                              : "bg-muted/30 border-white/5 text-muted-foreground hover:bg-muted/50 hover:border-white/10"
                          )}
                        >
                          {r} <span className="tabular-nums opacity-80">{comment.reactions[r] || 0}</span>
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="ml-auto text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all px-3 py-1.5 rounded-xl hover:bg-primary/5"
                    >
                      Reply
                    </button>
                  </div>

                  {replyTo === comment.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 mt-4 p-3 bg-muted/30 rounded-2xl border border-white/5"
                    >
                      <input 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                        placeholder="Write a reply..." 
                        autoFocus
                        className="flex-1 px-4 py-2 bg-muted/50 focus:bg-card rounded-xl text-sm transition-all focus:outline-none text-foreground border border-transparent focus:border-primary/20" 
                      />
                      <button 
                        onClick={() => submitReply(comment.id)} 
                        className="px-4 py-2 gradient-brand text-white rounded-xl shadow-glow active:scale-95 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {getReplies(comment.id).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                      {getReplies(comment.id).map((reply) => (
                        <div key={reply.id} className="pl-4 border-l-2 border-primary/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary/80">{reply.userAlias}</span>
                            <TimeAgo date={reply.createdAt} className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50" />
                          </div>
                          <p className="text-sm text-muted-foreground">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
