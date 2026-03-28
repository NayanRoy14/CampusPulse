import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, AlertTriangle, LogOut, Trash2, CheckCircle, Shield, XCircle, ChevronLeft, MessageSquare, Clock, TrendingUp, Send } from 'lucide-react';
import { CATEGORIES, type PostStatus } from '@/lib/types';
import type { Post } from '@/lib/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/TimeAgo';
import { motion } from 'framer-motion';

type Tab = 'overview' | 'posts' | 'moderation' | 'analytics';

const PostDetailModal = ({ postId, onClose }: { postId: string; onClose: () => void }) => {
  const { posts, comments, fetchComments, getCommentCount, updatePostStatus, addAdminResponse } = useStore();
  const [isReplying, setIsReplying] = useState(false);
  const [responseText, setResponseText] = useState('');

  const post = posts.find((p) => p.id === postId);
  
  useEffect(() => {
    fetchComments(postId);
  }, [postId, fetchComments]);

  if (!post) return null;

  const postComments = comments
    .filter(c => c.postId === post.id && !c.parentId)
    .sort((a, b) => b.votesCount - a.votesCount);
  const commentCount = getCommentCount(post.id);

  const handleSubmitResponse = () => {
    if (!responseText.trim()) return;
    addAdminResponse(post.id, responseText.trim());
    setResponseText('');
    setIsReplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 glass z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2.5 hover:bg-muted rounded-xl transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold heading-display text-xl">Post Details</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/50 p-1 rounded-xl border border-white/5">
              {(['Open', 'In Progress', 'Resolved'] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updatePostStatus(post.id, s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    post.status === s 
                      ? "bg-card text-primary shadow-glow border border-white/5" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <CategoryBadge category={post.category} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold heading-display text-foreground leading-tight">{post.title}</h1>
              <div className="flex-shrink-0"><StatusBadge status={post.status} /></div>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">{post.description}</p>
            {post.imageUrl && (
              <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-glow">
                <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-96" />
              </div>
            )}
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {post.userAlias}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> <TimeAgo date={post.createdAt} /></span>
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {post.votesCount} votes</span>
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {commentCount} comments</span>
            </div>
          </div>

          {post.adminResponse && (
            <div className="bg-primary/5 border border-primary/20 rounded-[1.5rem] p-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl -mr-12 -mt-12" />
              <div className="flex items-center gap-2 mb-3 text-primary font-bold uppercase tracking-widest text-[10px]">
                <Shield className="w-4 h-4" /> Official Admin Response
              </div>
              <p className="text-foreground leading-relaxed italic opacity-90">
                "{post.adminResponse}"
              </p>
            </div>
          )}

          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold heading-display text-lg flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                Comments ({postComments.length})
              </h3>
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> {isReplying ? 'Cancel Response' : 'Add Admin Response'}
              </button>
            </div>

            {isReplying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write an official response..."
                    className="w-full bg-muted/30 border border-white/10 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                  />
                  <button 
                    onClick={handleSubmitResponse}
                    className="absolute bottom-4 right-4 p-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-glow transition-all"
                    title="Submit Response"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {postComments.length === 0 ? (
                <div className="text-center py-12 glass rounded-[2rem] border-dashed border-2 border-white/5 opacity-50">
                  No comments yet
                </div>
              ) : (
                postComments.map((comment) => (
                  <div key={comment.id} className="glass rounded-[1.5rem] p-5 border-white/5 shadow-soft">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary tracking-wider uppercase">{comment.userAlias}</span>
                      <TimeAgo date={comment.createdAt} className="text-[10px] font-bold text-muted-foreground/60 uppercase" />
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, logoutAdmin, posts, reports, comments, updatePostStatus, addAdminResponse, removePost, resolveReport, banUser, fetchPosts, fetchReports } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [responsePostId, setResponsePostId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    } else {
      fetchPosts();
      fetchReports();
    }
  }, [isAdmin, navigate, fetchPosts, fetchReports]);

  const totalPosts = posts.length;
  const uniqueUsers = new Set(posts.map((p) => p.userId)).size;
  const pendingReports = reports.filter((r) => !r.resolved).length;
  const avgSentiment = posts.length ? (posts.reduce((s, p) => s + p.sentimentScore, 0) / posts.length).toFixed(2) : '0';
  const categoryCounts = CATEGORIES.map((c) => ({ category: c, count: posts.filter((p) => p.category === c).length }));
  const negPosts = [...posts]
    .filter((p) => p.sentimentScore < 0)
    .sort((a, b) => a.sentimentScore - b.sentimentScore);

  const submitResponse = (postId: string) => {
    if (!responseText.trim()) return;
    addAdminResponse(postId, responseText.trim());
    setResponsePostId(null);
    setResponseText('');
    alert('Official response added successfully!');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'posts', label: 'All Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'moderation', label: 'Moderation', icon: <Shield className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative">
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold heading-display text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium opacity-70 whitespace-nowrap">Management & Moderation Hub</p>
          </div>
        </div>
        <button 
          onClick={() => { logoutAdmin(); navigate('/'); }} 
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/10 transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="flex gap-1.5 bg-muted/50 p-1.5 rounded-2xl w-fit border border-white/5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
              tab === t.id ? 'bg-card text-primary shadow-glow border border-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Posts', value: totalPosts, icon: <FileText className="w-6 h-6" />, color: 'bg-primary/10 text-primary' },
              { label: 'Active Users', value: uniqueUsers, icon: <Users className="w-6 h-6" />, color: 'bg-accent/10 text-accent' },
              { label: 'Reports', value: pendingReports, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-destructive/10 text-destructive' },
              { label: 'Avg Sentiment', value: avgSentiment, icon: <BarChart3 className="w-6 h-6" />, color: 'bg-secondary/10 text-secondary' },
            ].map((stat) => (
              <motion.div 
                key={stat.label} 
                whileHover={{ scale: 1.02 }}
                className="glass rounded-[2rem] p-6 shadow-soft border-white/5 flex flex-col items-center text-center space-y-3"
              >
                <div className={cn('p-3 rounded-2xl', stat.color)}>{stat.icon}</div>
                <div>
                  <p className="text-3xl font-black heading-display text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-[2.5rem] p-8 shadow-soft border-white/5">
              <h2 className="text-xl font-bold heading-display mb-6 text-foreground flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                Category Distribution
              </h2>
              <div className="space-y-5">
                {categoryCounts.sort((a, b) => b.count - a.count).map((c) => (
                  <div key={c.category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                      <span>{c.category}</span>
                      <span className="tabular-nums">{c.count}</span>
                    </div>
                    <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${totalPosts ? (c.count / totalPosts) * 100 : 0}%` }}
                        className="h-full gradient-brand rounded-full shadow-glow" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 shadow-soft border-white/5">
              <h2 className="text-xl font-bold heading-display mb-6 text-foreground flex items-center gap-3">
                <div className="w-1.5 h-6 bg-secondary rounded-full" />
                Quick Management
              </h2>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="space-y-3">
                    <div className="relative flex items-center gap-4 p-4 bg-muted/30 rounded-[1.5rem] border border-white/5 group hover:border-primary/20 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={post.status} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button onClick={() => setSelectedPostId(post.id)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all active:scale-90" title="View Details">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => responsePostId === post.id ? setResponsePostId(null) : setResponsePostId(post.id)} 
                          className={cn(
                            "p-2 rounded-lg transition-all active:scale-90",
                            responsePostId === post.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                          title="Respond"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => removePost(post.id)} className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all active:scale-90" title="Remove Post">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {responsePostId === post.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-muted/20 rounded-[1.5rem] border border-white/5 space-y-3"
                      >
                        <div className="relative">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write an official response..."
                            className="w-full bg-muted/30 border border-white/10 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-none"
                          />
                          <button 
                            onClick={() => submitResponse(post.id)}
                            className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-lg hover:shadow-glow transition-all"
                            title="Submit Response"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <button onClick={() => setResponsePostId(null)} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
                {posts.length > 5 && (
                  <button onClick={() => setTab('posts')} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                    View All Posts →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'posts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold heading-display text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              All Platform Posts ({posts.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-2 border-white/5">
                <p className="text-xl font-bold text-foreground">No posts found</p>
                <p className="text-sm text-muted-foreground">Wait for users to share their thoughts.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="glass rounded-[2rem] p-6 shadow-soft border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">{post.title}</p>
                          <StatusBadge status={post.status} />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          <CategoryBadge category={post.category} />
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {post.userAlias}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <TimeAgo date={post.createdAt} /></span>
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {post.votesCount} votes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-muted/50 p-1 rounded-xl border border-white/5">
                        {(['Open', 'In Progress', 'Resolved'] as PostStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updatePostStatus(post.id, s)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              post.status === s 
                                ? "bg-card text-primary shadow-glow border border-white/5" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setSelectedPostId(post.id)} className="p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all active:scale-95" title="View Details">
                        <FileText className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => responsePostId === post.id ? setResponsePostId(null) : setResponsePostId(post.id)} 
                        className={cn(
                          "p-3 rounded-xl transition-all active:scale-95",
                          responsePostId === post.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        title="Respond"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button onClick={() => removePost(post.id)} className="p-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all active:scale-95" title="Remove Post">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {responsePostId === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-white/5 space-y-4"
                    >
                      <div className="relative">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write an official response..."
                          className="w-full bg-muted/30 border border-white/10 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-none"
                        />
                        <button 
                          onClick={() => submitResponse(post.id)}
                          className="absolute bottom-4 right-4 p-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-glow transition-all"
                          title="Submit Response"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setResponsePostId(null)} className="px-5 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'moderation' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold heading-display text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            Pending Reports ({pendingReports})
          </h2>
          
          <div className="grid gap-4">
            {reports.filter((r) => !r.resolved).length === 0 ? (
              <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-2 border-white/5">
                <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <p className="text-xl font-bold text-foreground">All Clear!</p>
                <p className="text-sm text-muted-foreground">No pending reports at the moment.</p>
              </div>
            ) : (
              reports.filter((r) => !r.resolved).map((report) => {
                const targetPost = posts.find((p) => p.id === report.targetId);
                return (
                  <div key={report.id} className="glass rounded-[2rem] p-6 shadow-soft border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 blur-2xl -mr-12 -mt-12" />
                    <div className="flex items-start justify-between relative z-10">
                      <div className="space-y-3">
                        <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-lg border border-destructive/20">{report.reason}</span>
                        <div>
                          <p className="text-lg font-bold text-foreground group-hover:text-destructive transition-colors">{targetPost?.title || 'Deleted content'}</p>
                          <p className="text-xs font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Reported by {report.userId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => resolveReport(report.id)} className="p-3 bg-success/10 text-success hover:bg-success/20 rounded-xl transition-all active:scale-90 shadow-glow shadow-success/10" title="Resolve Report">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => { removePost(report.targetId); resolveReport(report.id); }} className="p-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all active:scale-90 shadow-glow shadow-destructive/10" title="Remove Reported Post">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {targetPost && (
                          <button onClick={() => { banUser(targetPost.userId); resolveReport(report.id); }} className="p-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-all active:scale-90" title="Ban User">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-[2.5rem] p-8 shadow-soft border-white/5">
              <h2 className="text-xl font-bold heading-display mb-6 text-foreground flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-xl"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                Negative Sentiment Alerts
              </h2>
              <div className="space-y-4">
                {negPosts.length === 0 ? (
                  <div className="text-center py-10 opacity-50 italic text-muted-foreground text-sm">
                    No negative sentiment alerts found
                  </div>
                ) : (
                  negPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-destructive/5 rounded-[1.5rem] border border-destructive/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-foreground">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <CategoryBadge category={post.category} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Score: {post.sentimentScore.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums text-muted-foreground whitespace-nowrap">{post.votesCount} votes</span>
                        <button onClick={() => setSelectedPostId(post.id)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all active:scale-90">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-[2.5rem] p-8 shadow-soft border-white/5">
              <h2 className="text-xl font-bold heading-display mb-6 text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><TrendingUp className="w-5 h-5 text-primary" /></div>
                Most Upvoted Issues
              </h2>
              <div className="space-y-4">
                {[...posts].sort((a, b) => b.votesCount - a.votesCount).length === 0 ? (
                  <div className="text-center py-10 opacity-50 italic text-muted-foreground text-sm">
                    No posts found
                  </div>
                ) : (
                  [...posts].sort((a, b) => b.votesCount - a.votesCount).slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-[1.5rem] border border-white/5">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-2xl font-black text-primary/30 tabular-nums">{post.votesCount}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-foreground">{post.title}</p>
                          <CategoryBadge category={post.category} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={post.status} />
                        <button onClick={() => setSelectedPostId(post.id)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all active:scale-90">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
