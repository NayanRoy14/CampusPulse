import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import type { Post, Comment, Vote, Report, User, Category, SortMode, VoteType, PostStatus, ReportReason, UserReaction } from './types';

// Seed data removed to use Supabase
const generateId = () => crypto.randomUUID();
const generateAlias = () => `User_${Math.floor(10000 + Math.random() * 90000)}`;

interface AppState {
  // User
  currentUser: User | null;
  darkMode: boolean;

  // Data
  posts: Post[];
  comments: Comment[];
  votes: Vote[];
  reports: Report[];
  userReactions: UserReaction[];

  // UI
  sortMode: SortMode;
  selectedCategory: Category | null;
  searchQuery: string;
  isAdmin: boolean;

  // Actions
  initUser: () => Promise<void>;
  login: (userId: string, password?: string) => Promise<void>;
  signup: (userId: string, password?: string, fullName?: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchUserReactions: () => Promise<void>;
  subscribeToChanges: () => () => void;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  setSortMode: (mode: SortMode) => void;
  setSelectedCategory: (cat: Category | null) => void;
  setSearchQuery: (q: string) => void;

  createPost: (title: string, description: string, category: Category, imageUrl?: string) => Promise<void>;
  togglePostStatus: (postId: string) => Promise<void>;
  voteOnPost: (postId: string, voteType: VoteType) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  voteOnComment: (commentId: string, voteType: VoteType) => Promise<void>;
  reactToComment: (commentId: string, reaction: string) => Promise<void>;
  reportContent: (targetId: string, targetType: 'post' | 'comment', reason: ReportReason) => Promise<void>;

  // Admin
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  updatePostStatus: (postId: string, status: PostStatus) => Promise<void>;
  addAdminResponse: (postId: string, response: string) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
  banUser: (userId: string) => void;
  resolveReport: (reportId: string) => Promise<void>;

  getSortedPosts: () => Post[];
  getPostComments: (postId: string) => Comment[];
  getCommentCount: (postId: string) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      darkMode: false,
      posts: [],
      comments: [],
      votes: [],
      reports: [],
      userReactions: [],
      sortMode: 'trending',
      selectedCategory: null,
      searchQuery: '',
      isAdmin: false,

      initUser: async () => {
        try {
          // 1. Check if we have a persistent user from the store
          const current = get().currentUser;
          
          if (current?.email) {
            // This is a logged-in user, refresh their ban status
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_banned')
              .eq('id', current.id)
              .single();

            if (profile?.is_banned) {
              alert('Your account has been banned.');
              get().logout();
              return;
            }
          }

          if (!get().currentUser) {
            set({
              currentUser: {
                id: generateId(),
                alias: generateAlias(),
                isBanned: false,
                createdAt: new Date().toISOString(),
              },
            });
          }
        } catch (err: any) {
          console.error('Auth initialization error:', err);
        } finally {
          await get().fetchPosts();
          await get().fetchReports();
          await get().fetchUserReactions();
        }
      },

      login: async (userId, password?) => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id_display', userId.trim().toLowerCase())
            .single();

          if (error) {
            if (error.code === 'PGRST116') throw new Error('User ID not found.');
            throw error;
          }

          if (profile.is_banned) {
            throw new Error('This account has been banned.');
          }

          if (password && profile.password && profile.password !== password) {
            throw new Error('Invalid password.');
          }

          set({
            currentUser: {
              id: profile.id,
              alias: profile.user_id_display,
              email: `${profile.user_id_display}@campuspulse.edu`,
              isBanned: profile.is_banned,
              createdAt: profile.created_at,
            },
          });
        } catch (err: any) {
          console.error('Login error:', err);
          throw err;
        }
      },

      signup: async (userId: string, password?: string, fullName?: string) => {
        try {
          const normalizedId = userId.trim().toLowerCase();
          
          // Check if user already exists
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id_display', normalizedId)
            .single();

          if (existing) {
            throw new Error('This User ID is already taken.');
          }

          const newId = generateId();
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: newId,
              user_id_display: normalizedId,
              password: password || null,
              full_name: fullName || normalizedId,
            }]);

          if (insertError) throw insertError;

          set({
            currentUser: {
              id: newId,
              alias: normalizedId,
              email: `${normalizedId}@campuspulse.edu`,
              isBanned: false,
              createdAt: new Date().toISOString(),
            },
          });
        } catch (err: any) {
          console.error('Signup error:', err);
          throw err;
        }
      },

      logout: async () => {
        set({
          currentUser: {
            id: generateId(),
            alias: generateAlias(),
            isBanned: false,
            createdAt: new Date().toISOString(),
          },
        });
      },

      fetchPosts: async () => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching posts from Supabase:', error);
            if (error.message === 'TypeError: Failed to fetch') {
              console.warn('Network issue detected: This usually means the browser cannot reach your Supabase instance. Check your internet connection or verify your Supabase project status at https://supabase.com/dashboard');
            }
            return;
          }

          if (!data) {
            set({ posts: [] });
            return;
          }

          const mappedPosts: Post[] = data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            userAlias: p.user_alias || `User_${p.user_id.slice(0, 5)}`,
            title: p.title,
            description: p.content,
            category: p.category as Category,
            imageUrl: p.image_url,
            sentimentScore: p.sentiment_score || 0,
            votesCount: p.votes || 0,
            commentsCount: p.comments_count || 0,
            status: (p.status || 'Open') as PostStatus,
            createdAt: p.created_at,
            adminResponse: p.admin_response,
          }));

          set({ posts: mappedPosts });
        } catch (err) {
          console.error('Unexpected error fetching posts:', err);
        }
      },

       fetchComments: async (postId: string) => {
         try {
           const { data, error } = await supabase
             .from('comments')
             .select('*')
             .eq('post_id', postId)
             .order('created_at', { ascending: true });

           if (error) {
             console.error('Error fetching comments:', error);
             return;
           }

           const mappedComments: Comment[] = data.map((c: any) => ({
             id: c.id,
             postId: c.post_id,
             userId: c.user_id,
             userAlias: c.user_alias || `User_${c.user_id.slice(0, 5)}`,
             parentId: c.parent_id,
             content: c.content,
             votesCount: c.votes || 0,
             reactions: c.reactions || {},
             createdAt: c.created_at,
           }));

           set((s) => ({
             comments: [
               ...s.comments.filter((c) => c.postId !== postId),
               ...mappedComments,
             ],
           }));
         } catch (err: any) {
           console.error('Unexpected error fetching comments:', err);
         }
       },

       fetchReports: async () => {
         try {
           const { data, error } = await supabase
             .from('reports')
             .select('*')
             .order('created_at', { ascending: false });

           if (error) {
             console.error('Error fetching reports:', error);
             return;
           }

           const mappedReports: Report[] = data.map((r: any) => ({
             id: r.id,
             targetId: r.target_id,
             targetType: r.type as 'post' | 'comment',
             userId: r.user_id || 'anon',
             reason: r.reason as ReportReason,
             createdAt: r.created_at,
             resolved: r.resolved || false,
           }));

           set({ reports: mappedReports });
         } catch (err) {
           console.error('Unexpected error fetching reports:', err);
         }
       },

       fetchUserReactions: async () => {
         try {
           const user = get().currentUser;
           if (!user) return;

           const { data, error } = await supabase
             .from('user_reactions')
             .select('*')
             .eq('user_id', user.id);

           if (error) {
             console.error('Error fetching user reactions:', error);
             return;
           }

           const mappedReactions: UserReaction[] = data.map((r: any) => ({
             id: r.id,
             userId: r.user_id,
             commentId: r.comment_id,
             reactionType: r.reaction_type,
             createdAt: r.created_at,
           }));

           set({ userReactions: mappedReactions });
         } catch (err) {
           console.error('Unexpected error fetching reactions:', err);
         }
       },

       subscribeToChanges: () => {
         const postsSubscription = supabase
           .channel('public:posts')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
             get().fetchPosts();
           })
           .subscribe();

         const commentsSubscription = supabase
           .channel('public:comments')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
             // 1. Refresh posts because comments_count might have changed in DB via trigger
             get().fetchPosts();
             
             // 2. If it's the current post being viewed, refresh its comments
             if (payload.new && (payload.new as any).post_id) {
               get().fetchComments((payload.new as any).post_id);
             } else if (payload.old && (payload.old as any).post_id) {
               get().fetchComments((payload.old as any).post_id);
             }
           })
           .subscribe();

         const reportsSubscription = supabase
           .channel('public:reports')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
             get().fetchReports();
           })
           .subscribe();

         const userReactionsSubscription = supabase
           .channel('public:user_reactions')
           .on('postgres_changes', { event: '*', schema: 'public', table: 'user_reactions' }, () => {
             get().fetchUserReactions();
           })
           .subscribe();

         return () => {
           supabase.removeChannel(postsSubscription);
           supabase.removeChannel(commentsSubscription);
           supabase.removeChannel(reportsSubscription);
           supabase.removeChannel(userReactionsSubscription);
         };
       },

       toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        document.documentElement.classList.toggle('dark', next);
      },

      setSortMode: (mode) => set({ sortMode: mode }),
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      createPost: async (title, description, category, imageUrl) => {
        try {
          const user = get().currentUser;
          if (!user) {
            alert('You must be logged in to post.');
            return;
          }
          
          // Simple Sentiment Analysis Mock
          const negativeWords = ['terrible', 'bad', 'awful', 'inedible', 'unacceptable', 'broken', 'disgusting', 'failed'];
          const positiveWords = ['great', 'good', 'excellent', 'amazing', 'perfect', 'resolved', 'happy'];
          
          const content = (title + ' ' + description).toLowerCase();
          let score = 0;
          negativeWords.forEach(w => { if (content.includes(w)) score -= 0.2; });
          positiveWords.forEach(w => { if (content.includes(w)) score += 0.2; });
          score = Math.max(-1, Math.min(1, score));

          const { data, error } = await supabase
            .from('posts')
            .insert([{
              user_id: user.id,
              user_alias: user.alias,
              title,
              content: description,
              category,
              image_url: imageUrl,
              sentiment_score: score,
              status: 'Open',
            }])
            .select();

          if (error) {
            console.error('Error creating post:', error);
            alert(`Failed to create post: ${error.message}`);
            return;
          }

          if (data) {
            await get().fetchPosts();
            alert('Post created successfully!');
          }
        } catch (err: any) {
          console.error('Unexpected error creating post:', err);
          alert(`An unexpected error occurred: ${err.message}`);
        }
      },

      togglePostStatus: async (postId) => {
        try {
          const post = get().posts.find(p => p.id === postId);
          if (!post) return;

          const nextStatus: PostStatus = post.status === 'Resolved' ? 'Open' : 'Resolved';
          
          const { error } = await supabase
            .from('posts')
            .update({ status: nextStatus })
            .eq('id', postId);

          if (error) {
            console.error('Error toggling post status:', error);
            return;
          }

          await get().fetchPosts();
        } catch (err) {
          console.error('Unexpected error toggling status:', err);
        }
      },

      voteOnPost: async (postId, voteType) => {
        try {
          const user = get().currentUser;
          if (!user) return;

          // 1. Get latest count from DB
          const { data: postData } = await supabase
            .from('posts')
            .select('votes')
            .eq('id', postId)
            .single();

          const currentVotes = postData?.votes || 0;
          const delta = voteType === 'up' ? 1 : -1;
          
          // 2. Update with new count
          const { error } = await supabase
            .from('posts')
            .update({ votes: currentVotes + delta })
            .eq('id', postId);

          if (error) {
            console.error('Error voting on post:', error);
            return;
          }

          await get().fetchPosts();
        } catch (err) {
          console.error('Unexpected error voting on post:', err);
        }
      },

      addComment: async (postId, content, parentId) => {
        try {
          const user = get().currentUser;
          if (!user) {
            alert('You must be logged in to comment.');
            return;
          }

          const { error: commentError } = await supabase
            .from('comments')
            .insert([{
              post_id: postId,
              user_id: user.id,
              user_alias: user.alias,
              content,
              parent_id: parentId || null,
            }]);

          if (commentError) {
            console.error('Error adding comment:', commentError);
            alert(`Failed to add comment: ${commentError.message}`);
            return;
          }

          // 1. Refresh data
          await get().fetchComments(postId);
          await get().fetchPosts();
        } catch (err: any) {
          console.error('Unexpected error adding comment:', err);
          alert(`An unexpected error occurred: ${err.message}`);
        }
      },

      voteOnComment: async (commentId, voteType) => {
        try {
          // 1. Get latest count from DB
          const { data: commentData } = await supabase
            .from('comments')
            .select('votes, post_id')
            .eq('id', commentId)
            .single();

          if (!commentData) return;

          const currentVotes = commentData.votes || 0;
          const delta = voteType === 'up' ? 1 : -1;
          
          // 2. Update with new count
          const { error } = await supabase
            .from('comments')
            .update({ votes: currentVotes + delta })
            .eq('id', commentId);

          if (error) {
            console.error('Error voting on comment:', error);
            return;
          }

          await get().fetchComments(commentData.post_id);
        } catch (err) {
          console.error('Unexpected error voting on comment:', err);
        }
      },

      reactToComment: async (commentId, reaction) => {
        try {
          const user = get().currentUser;
          if (!user) return;

          // 1. Check if user has already reacted to this comment
          const existingReaction = get().userReactions.find(
            (r) => r.commentId === commentId && r.userId === user.id
          );

          // 2. Get latest comment data from DB
          const { data: commentData } = await supabase
            .from('comments')
            .select('reactions, post_id')
            .eq('id', commentId)
            .single();

          if (!commentData) return;

          const currentReactions = { ...(commentData.reactions || {}) };

          if (existingReaction) {
            if (existingReaction.reactionType === reaction) {
              // Case 1: Same reaction - Toggle off (Remove it)
              currentReactions[reaction] = Math.max(0, (currentReactions[reaction] || 0) - 1);
              
              // Delete from tracking table
              await supabase
                .from('user_reactions')
                .delete()
                .eq('id', existingReaction.id);
            } else {
              // Case 2: Different reaction - Switch it
              // Remove old reaction count
              const oldType = existingReaction.reactionType;
              currentReactions[oldType] = Math.max(0, (currentReactions[oldType] || 0) - 1);
              
              // Add new reaction count
              currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;
              
              // Update tracking table
              await supabase
                .from('user_reactions')
                .update({ reaction_type: reaction })
                .eq('id', existingReaction.id);
            }
          } else {
            // Case 3: New reaction - Add it
            currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;
            
            // Insert into tracking table
            await supabase
              .from('user_reactions')
              .insert([{
                user_id: user.id,
                comment_id: commentId,
                reaction_type: reaction
              }]);
          }

          // 3. Update the comment's reaction counts in DB
          const { error } = await supabase
            .from('comments')
            .update({ reactions: currentReactions })
            .eq('id', commentId);

          if (error) {
            console.error('Error updating comment reactions:', error);
            return;
          }

          // 4. Refresh data
          await get().fetchUserReactions();
          await get().fetchComments(commentData.post_id);
        } catch (err) {
          console.error('Unexpected error reacting to comment:', err);
        }
      },

      reportContent: async (targetId, targetType, reason) => {
        try {
          const user = get().currentUser;
          if (!user) return;

          const { error } = await supabase
            .from('reports')
            .insert([{
              target_id: targetId,
              type: targetType,
              reason,
              user_id: user.id,
              resolved: false,
            }]);

          if (error) {
            console.error('Error reporting content:', error);
          } else {
            await get().fetchReports();
          }
        } catch (err) {
          console.error('Unexpected error reporting content:', err);
        }
      },

      loginAdmin: (password) => {
        if (password === 'admin123') {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdmin: false }),

      updatePostStatus: async (postId, status) => {
        try {
          const { error } = await supabase
            .from('posts')
            .update({ status })
            .eq('id', postId);

          if (error) {
            console.error('Error updating post status:', error);
            // Fallback
            set((s) => ({ posts: s.posts.map((p) => p.id === postId ? { ...p, status } : p) }));
          } else {
            await get().fetchPosts();
          }
        } catch (err) {
          console.error('Unexpected error updating status:', err);
        }
      },
      addAdminResponse: async (postId, response) => {
        try {
          const post = get().posts.find(p => p.id === postId);
          const updates: any = { admin_response: response };
          
          // Automatically set status to 'In Progress' if it's currently 'Open'
          if (post && post.status === 'Open') {
            updates.status = 'In Progress';
          }

          const { error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId);

          if (error) {
            console.error('Error adding admin response:', error);
            // Fallback
            set((s) => ({ 
              posts: s.posts.map((p) => 
                p.id === postId 
                  ? { ...p, adminResponse: response, status: updates.status || p.status } 
                  : p
              ) 
            }));
          } else {
            await get().fetchPosts();
          }
        } catch (err) {
          console.error('Unexpected error adding admin response:', err);
        }
      },
      removePost: async (postId) => {
        try {
          const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

          if (error) {
            console.error('Error removing post:', error);
            // Fallback
            set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
          } else {
            await get().fetchPosts();
          }
        } catch (err) {
          console.error('Unexpected error removing post:', err);
        }
      },
      banUser: async (userId) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ is_banned: true })
            .eq('id', userId);

          if (error) {
            console.error('Error banning user:', error);
            alert(`Failed to ban user: ${error.message}`);
          } else {
            // Remove user's posts from local state
            set((s) => ({ posts: s.posts.filter((p) => p.userId !== userId) }));
            alert('User banned and posts removed successfully.');
          }
        } catch (err: any) {
          console.error('Unexpected error banning user:', err);
          alert(`An unexpected error occurred: ${err.message}`);
        }
      },
      resolveReport: async (reportId) => {
        try {
          const { error } = await supabase
            .from('reports')
            .update({ resolved: true })
            .eq('id', reportId);

          if (error) {
            console.error('Error resolving report:', error);
            // Fallback to local state if needed
            set((s) => ({ reports: s.reports.map((r) => r.id === reportId ? { ...r, resolved: true } : r) }));
          } else {
            await get().fetchReports();
          }
        } catch (err) {
          console.error('Unexpected error resolving report:', err);
        }
      },

      getSortedPosts: () => {
        const { posts, sortMode, selectedCategory, searchQuery } = get();
        let filtered = posts;
        if (selectedCategory) filtered = filtered.filter((p) => p.category === selectedCategory);
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        switch (sortMode) {
          case 'latest':
            return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          case 'top':
            return [...filtered].sort((a, b) => b.votesCount - a.votesCount);
          case 'trending':
          default: {
            const now = Date.now();
            const score = (p: Post) => {
              const age = (now - new Date(p.createdAt).getTime()) / 3600000;
              return (p.votesCount * 2 + p.commentsCount * 3 + (1 - p.sentimentScore) * 5) / Math.pow(age + 2, 1.5);
            };
            return [...filtered].sort((a, b) => score(b) - score(a));
          }
        }
      },

      getPostComments: (postId) => {
        return get().comments.filter((c) => c.postId === postId);
      },

      getCommentCount: (postId) => {
        const post = get().posts.find(p => p.id === postId);
        const loadedComments = get().comments.filter(c => c.postId === postId).length;
        
        // Return the larger of the two values to ensure accuracy while waiting for sync
        return Math.max(post?.commentsCount || 0, loadedComments);
      },
    }),
    { name: 'campuspulse-store' }
  )
);
