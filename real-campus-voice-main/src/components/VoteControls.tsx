import { ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface VoteControlsProps {
  targetId: string;
  targetType: 'post' | 'comment';
  votesCount: number;
  vertical?: boolean;
}

export const VoteControls = ({ targetId, targetType, votesCount, vertical = true }: VoteControlsProps) => {
  const { currentUser, votes, voteOnPost, voteOnComment } = useStore();
  const userVote = votes.find(
    (v) => v.userId === currentUser?.id && v.targetId === targetId && v.targetType === targetType
  );

  const handleVote = (type: 'up' | 'down') => {
    if (targetType === 'post') voteOnPost(targetId, type);
    else voteOnComment(targetId, type);
  };

  return (
    <div className={cn(
      'flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-white/5 shadow-inner',
      vertical ? 'flex-col min-w-[40px]' : 'flex-row'
    )}>
      <button
        onClick={() => handleVote('up')}
        className={cn(
          'p-2 rounded-xl transition-all hover:scale-110 active:scale-90 group/vote',
          userVote?.voteType === 'up' ? 'text-primary bg-primary/20 shadow-glow' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
        )}
      >
        <ChevronUp className="w-5 h-5 group-hover/vote:-translate-y-0.5 transition-transform" />
      </button>
      
      <span className={cn(
        'text-sm font-black heading-display tabular-nums min-w-[2ch] text-center transition-colors',
        votesCount > 0 ? 'text-primary' : votesCount < 0 ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {votesCount}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        className={cn(
          'p-2 rounded-xl transition-all hover:scale-110 active:scale-90 group/vote',
          userVote?.voteType === 'down' ? 'text-destructive bg-destructive/20 shadow-glow shadow-destructive/10' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
        )}
      >
        <ChevronDown className="w-5 h-5 group-hover/vote:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
