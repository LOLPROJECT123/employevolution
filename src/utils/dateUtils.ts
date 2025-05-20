
import { format, formatDistanceToNow, isToday, isYesterday, differenceInHours, differenceInMinutes } from "date-fns";

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy");
};

export const formatRelativeTime = (date: string | Date) => {
  // Check if the date string is a proper date format
  try {
    // If the date is just a string like "2 days ago", return it directly
    if (typeof date === 'string' && (
        date.includes('ago') || 
        date.includes('yesterday') || 
        date.includes('today') ||
        date.includes('minutes') ||
        date.includes('hours') ||
        date.includes('days')
    )) {
      return date;
    }
    
    const dateObj = new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return typeof date === 'string' ? date : 'Invalid date';
    }
    
    const now = new Date();
    
    const diffHours = differenceInHours(now, dateObj);
    const diffMinutes = differenceInMinutes(now, dateObj);
    
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? "1 Minute Ago" : `${diffMinutes} Minutes Ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 Hour Ago" : `${diffHours} Hours Ago`;
    } else if (isYesterday(dateObj)) {
      return "Yesterday";
    } else if (now.getFullYear() === dateObj.getFullYear()) {
      return format(dateObj, "MMM dd");
    } else {
      return format(dateObj, "MMM dd, yyyy");
    }
  } catch (error) {
    // If any error occurs during date parsing or formatting, return a fallback
    console.warn("Date parsing error:", error);
    return typeof date === 'string' ? date : 'Unknown date';
  }
};
