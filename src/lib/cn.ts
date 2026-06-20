import clsx, { type ClassValue } from "clsx";

// Single class-merge helper. Use everywhere instead of template strings.
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
