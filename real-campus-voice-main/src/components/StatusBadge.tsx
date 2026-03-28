import { type PostStatus, STATUS_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

export const StatusBadge = ({ status }: { status: PostStatus }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
    status === 'Open' && 'bg-secondary/10 text-secondary border-secondary/20',
    status === 'In Progress' && 'bg-info/10 text-info border-info/20',
    status === 'Resolved' && 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
  )}>
    <span className="text-[8px]">
      {status === 'Open' && '●'} 
      {status === 'In Progress' && '⚡'} 
      {status === 'Resolved' && '✓'}
    </span>
    {status}
  </span>
);
