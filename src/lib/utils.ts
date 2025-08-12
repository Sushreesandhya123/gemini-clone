// utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format timestamps into human-readable form
export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

// Format phone number with country code
export function formatPhoneNumber(phone: string, countryCode: string): string {
  return `${countryCode} ${phone}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Copy text to clipboard
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// ✅ Generate a random ID (this was missing in exports before)
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Scroll an element to the bottom
export function scrollToBottom(element: HTMLElement): void {
  element.scrollTop = element.scrollHeight;
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

// Convert a file to Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
