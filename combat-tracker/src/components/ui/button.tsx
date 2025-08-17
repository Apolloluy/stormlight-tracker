
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const variants: Record<string,string> = {
  default: 'bg-cyan-700/80 hover:bg-cyan-600/80 text-white',
  secondary: 'bg-slate-800/70 hover:bg-slate-700/70 text-slate-100',
  outline: 'border border-slate-600/60 bg-transparent hover:bg-slate-900/40',
  destructive: 'bg-rose-700/70 hover:bg-rose-600/70 text-white',
  ghost: 'bg-transparent hover:bg-slate-800/50'
}
const sizes: Record<string,string> = {
  default: 'h-9 px-4 rounded-xl',
  sm: 'h-8 px-3 rounded-lg text-sm',
  lg: 'h-11 px-6 rounded-2xl text-base',
  icon: 'h-9 w-9 grid place-items-center rounded-xl'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant='default', size='default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn('transition-colors', variants[variant], sizes[size], className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
