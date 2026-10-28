import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | Date | null, format = "MMM D, YYYY") {
  if (!date) return "—";
  return dayjs(date).format(format);
}

export function formatDateTime(date?: string | Date | null) {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY · h:mm A");
}

export function formatCurrency(amount?: number | null, currency = "GH₵") {
  if (amount === undefined || amount === null) return "—";
  return `${currency} ${amount.toLocaleString()}`;
}

export function getInitials(name?: string) {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
