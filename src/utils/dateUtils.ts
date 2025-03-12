
import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return format(d, "MMM dd, yyyy");
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
