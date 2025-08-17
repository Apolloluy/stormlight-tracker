
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: any[]) {
  // @ts-ignore
  return twMerge(clsx(inputs))
}
