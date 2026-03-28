import { CATEGORY_ICONS, type Category } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES: Record<Category, string> = {
  Food: 'bg-secondary/15 text-secondary border-secondary/30',
  Facilities: 'bg-primary/15 text-primary border-primary/30',
  Safety: 'bg-destructive/15 text-destructive border-destructive/30',
  Academics: 'bg-accent/15 text-accent border-accent/30',
  Cleanliness: 'bg-success/15 text-success border-success/30',
};

export const CategoryBadge = ({ category, className }: { category: Category; className?: string }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
    CATEGORY_STYLES[category],
    className
  )}>
    {CATEGORY_ICONS[category]} {category}
  </span>
);
