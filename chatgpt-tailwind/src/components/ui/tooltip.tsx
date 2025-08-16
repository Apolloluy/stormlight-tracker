
import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger
export const TooltipContent = ({ children }:{children:React.ReactNode}) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content sideOffset={6} className='rounded-lg border border-slate-700/60 bg-slate-900/95 px-2 py-1 text-xs'>
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
)
