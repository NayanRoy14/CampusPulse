import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: string | number | Date | undefined) {
  if (!date) return 'some time ago';
  
  // Normalize Supabase date string (replace space with T for better cross-browser parsing)
  let normalizedDate = date;
  if (typeof date === 'string') {
    normalizedDate = date.replace(' ', 'T');
    // Ensure it ends with Z or an offset if it's from Supabase UTC
    if (!normalizedDate.includes('Z') && !normalizedDate.includes('+')) {
      normalizedDate += 'Z';
    }
  }

  const d = new Date(normalizedDate);
  if (isNaN(d.getTime())) return 'some time ago';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  // Handle slight server/local clock drift or "future" posts
  if (seconds < 5) return 'just now';
  if (seconds < 0) return 'in a moment';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  return `${Math.floor(months / 12)}y ago`;
}

export function formatAbsoluteDate(date: string | number | Date | undefined) {
  if (!date) return '';
  
  let normalizedDate = date;
  if (typeof date === 'string') {
    normalizedDate = date.replace(' ', 'T');
    if (!normalizedDate.includes('Z') && !normalizedDate.includes('+')) {
      normalizedDate += 'Z';
    }
  }

  const d = new Date(normalizedDate);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleString();
}
