
import { format, formatDistanceToNow, isToday, isYesterday, differenceInHours, differenceInMinutes } from "date-fns";

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy");
};

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = new Date(date);
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
};
