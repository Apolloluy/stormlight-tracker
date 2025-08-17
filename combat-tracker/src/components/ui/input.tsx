
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('h-10 w-full rounded-xl border border-slate-700/60 bg-slate-950/60 px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400/70', className)}
      {...props}
    />
  )
)
Input.displayName = 'Input'
