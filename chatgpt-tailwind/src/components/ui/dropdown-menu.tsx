
import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content className={cn('rounded-xl border border-slate-700/60 bg-slate-900/95 p-1', className)} sideOffset={8} {...props} />
  </DropdownMenuPrimitive.Portal>
)
export const DropdownMenuItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item className={cn('px-3 py-2 text-sm rounded-lg hover:bg-slate-800/80 cursor-pointer', className)} {...props} />
)
export const DropdownMenuSeparator = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className='my-1 h-px bg-slate-700/60' {...props} />
)
export const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-3 py-1 text-xs uppercase tracking-wide text-slate-300/70', className)} {...props} />
)
