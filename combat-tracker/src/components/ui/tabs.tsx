
import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root
export const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List className={cn('inline-flex rounded-xl border border-slate-700/60 bg-slate-900/60 p-1', className)} {...props} />
)
export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={cn('px-3 py-1.5 text-sm rounded-lg data-[state=active]:bg-cyan-700/40', className)} {...props} />
  )
)
TabsTrigger.displayName = 'TabsTrigger'
export const TabsContent = TabsPrimitive.Content
