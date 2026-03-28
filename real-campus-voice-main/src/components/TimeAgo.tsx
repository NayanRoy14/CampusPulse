import { useState, useEffect } from 'react';
import { formatTimeAgo, formatAbsoluteDate } from '@/lib/utils';

interface TimeAgoProps {
  date: string | number | Date | undefined;
  className?: string;
}

/**
 * A component that displays a "time ago" string and updates it every minute.
 */
export const TimeAgo = ({ date, className }: TimeAgoProps) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(date));

  useEffect(() => {
    // Initial update in case the component stayed in memory
    setTimeAgo(formatTimeAgo(date));

    // Update every 60 seconds (60000ms)
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <span className={className} title={formatAbsoluteDate(date)}>
      {timeAgo}
    </span>
  );
};
