
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('inline-flex items-center rounded-lg border border-slate-600/60 bg-slate-800/60 px-2 py-0.5 text-xs', className)} {...props} />
}
