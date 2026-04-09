import { isPast, endOfDay, parseISO, isToday } from "date-fns";

export const isTaskExpired = (task) => {
  if (!task.dueDate || task.isCompleted) return false;
  return (
    isPast(endOfDay(parseISO(task.dueDate))) && !isToday(parseISO(task.dueDate))
  );
};

export const getTaskStatus = (task) => {
  if (task.isCompleted) return "Completed";
  if (isTaskExpired(task)) return "Expired";
  return "Active";
};

export const truncate = (str, len = 50) =>
  str.length > len ? str.slice(0, len) + "..." : str;
