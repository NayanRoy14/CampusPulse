import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { CATEGORIES, CATEGORY_ICONS, type Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, ImagePlus, Send, X, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && uploadProgress === null;

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, and WEBP files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError('File size must be under 5MB.');
      return;
    }

    // Simulate upload progress & convert to base64
    setUploadProgress(0);
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setUploadProgress(null);
    };
    reader.onerror = () => {
      setImageError('Failed to read file.');
      setUploadProgress(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = () => {
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createPost(title.trim(), description.trim(), category, imagePreview ?? undefined);
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all mb-8 group"
      >
        <div className="p-2 rounded-xl bg-card border border-white/5 group-hover:border-primary/20 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="font-semibold">Back to Feed</span>
      </button>

      <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-glow border-white/5">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold heading-display text-foreground tracking-tight flex items-center gap-3">
            <span className="p-3 bg-primary/10 rounded-2xl text-2xl">✍️</span>
            Share Feedback
          </h1>
          <p className="text-muted-foreground font-medium opacity-70">
            Tell us what's on your mind. Your voice helps improve our campus community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your feedback a clear title"
              className="w-full px-6 py-4 bg-muted/50 focus:bg-card rounded-2xl text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl text-xs font-bold transition-all border group',
                    category === cat 
                      ? 'bg-primary border-primary text-white shadow-glow scale-[1.02]' 
                      : 'bg-muted/30 border-white/5 text-muted-foreground hover:bg-muted hover:border-primary/30'
                  )}
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the issue or suggestion..."
              rows={6}
              className="w-full px-6 py-4 bg-muted/50 focus:bg-card rounded-2xl text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground border border-transparent focus:border-primary/30 resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Image Upload (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {!imagePreview && uploadProgress === null && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-[2rem] text-sm text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="p-4 rounded-2xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <span className="font-medium">Attach Image (JPG, PNG, WEBP — max 5MB)</span>
              </button>
            )}

            {uploadProgress !== null && (
              <div className="space-y-3 px-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 rounded-full" />
              </div>
            )}

            {imagePreview && (
              <div className="relative group rounded-[2rem] overflow-hidden border border-white/5 shadow-glow">
                <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2.5 bg-destructive text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {imageError && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive mt-3 ml-1">
                <AlertCircle className="w-4 h-4" /> {imageError}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full py-5 rounded-[1.5rem] font-bold shadow-glow flex items-center justify-center gap-3 transition-all",
                canSubmit 
                  ? "gradient-brand text-white hover:scale-[1.02] active:scale-95"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" /> Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
