import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent,  TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, Zap, Moon, Undo2, User, Shield, EyeOff } from 'lucide-react'

import { Entity } from './Entity'
import { DEFAULT_STATUSES, DEFAULT_STATUS_ICONS, NEGATIVE_STATUSES, POSITIVE_STATUSES } from './Status'




export default function EntityCard({ entity, onUpdate, onRemove }:{ entity:Entity, onUpdate:(id:string, patch:Partial<Entity>)=>void, onRemove:(id:string)=>void }){
  const isPlayer = entity.type==='player';
  const investitureColor = isPlayer ? 'bg-cyan-700/40' : 'bg-purple-700/40';
  const unconscious = entity.unconscious;
  const isEmpowered = entity.statuses.includes('Empowered');
  const isInvested = entity.statuses.includes('Invested');
  function onDragStart(e:React.DragEvent){ e.dataTransfer.setData('text/plain', entity.id); }

  // Lightning effect styles (border/glow only)
  const empoweredEffect = isEmpowered ? 'empowered-glow' : '';
  const investedEffect = !isEmpowered && isInvested ? 'invested-glow' : '';

  // Handler for dash animation (to be implemented in App)
  const handleDash = () => {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('entityDash', {
        detail: {
          id: entity.id,
          from: entity.speed,
          to: entity.speed === 'fast' ? 'slow' : 'fast',
        },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`${unconscious ? 'opacity-50 grayscale' : ''} ${investitureColor} border border-slate-700/60 rounded-2xl p-3 hover:outline shadow-[0_0_30px_rgba(56,189,248,0.2)] outline-cyan-400/40 ${empoweredEffect} ${investedEffect}`}
      aria-label={`${entity.name} card`}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {/* Line 1: Icon, Name, Speed */}
      <div className="flex items-center gap-2 mb-1">
        {/* Placeholder hexagon character icon */}
        <span className="inline-block w-20 h-20 mr-2">
          <svg viewBox="0 0 80 80" width="80" height="80" style={{ display: 'block' }}>
            <defs>
              <clipPath id="hexClip">
                <polygon points="40,6 72,24 72,56 40,74 8,56 8,24" />
              </clipPath>
            </defs>
            <polygon points="40,6 72,24 72,56 40,74 8,56 8,24" fill="#232323" stroke="#ffd9009f" strokeWidth="6" />
            {/* Icon or placeholder centered and clipped to hexagon */}
            { entity.icon ? (
              <image href={entity.icon} x="8" y="8" width="64" height="64" style={{clipPath: 'url(#hexClip)'}} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <text x="40" y="48" textAnchor="middle" fill="#ffd9009f" fontSize="32" fontWeight="bold">?</text>
            )}
          </svg>
        </span>
        <div className="font-semibold text-slate-100">{entity.name}</div>
      </div>

      {/* Line 2: Effect Icons and +Add button floated right */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex items-center gap-1 flex-grow">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleDash} aria-label="Toggle speed">
                {entity.speed==='fast' ? <Moon className="size-4"/> : <Zap className="size-4"/>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Fast/Slow</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={()=>onUpdate(entity.id,{ reactionUsed: !entity.reactionUsed })} aria-label="Toggle reaction">
                <Undo2 className={`size-4 ${entity.reactionUsed?'text-orange-300':'text-slate-400'}`}/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reaction used (resets each round)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={()=>onUpdate(entity.id,{ unconscious: !entity.unconscious })} aria-label="Toggle unconscious">
                <EyeOff className={`size-4 ${entity.unconscious?'text-rose-300':'text-slate-400'}`}/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mark Unconscious</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={()=>onRemove(entity.id)} aria-label="Delete entity">
                <Trash2 className="size-4 text-slate-400"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove from encounter</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary"><Plus className="mr-1 size-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900/95 border-slate-700/70 max-h-64 overflow-y-auto">
              {DEFAULT_STATUSES.map(s => (
                <DropdownMenuItem key={s} onClick={()=>onUpdate(entity.id,{statuses:[...entity.statuses, s]})}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Line 3: Status labels */}
      { entity.statuses.length > 0 && (
        <div className="mt-2">
        <span className="text-xs uppercase tracking-wide text-slate-300/70">Statuses</span>
        <div className="flex flex-wrap gap-2">
          {entity.statuses.map((s, idx) => {
            let badgeColor = 'bg-slate-800/70 border-slate-600/60';
            if (POSITIVE_STATUSES.includes(s)) badgeColor = 'bg-cyan-800/70 border-cyan-400/60 text-cyan-100';
            if (NEGATIVE_STATUSES.includes(s)) badgeColor = 'bg-rose-900/70 border-rose-400/60 text-rose-100';
            return (
              <Badge key={`${s}-${idx}`} className={badgeColor}>
                <div className="flex items-center">
                  {DEFAULT_STATUS_ICONS[s] && (
                      DEFAULT_STATUS_ICONS[s]
                  )}
                  {s}
                  <button
                      className="ml-2 text-xs opacity-70 hover:opacity-100"
                      onClick={() => onUpdate(entity.id, { statuses: entity.statuses.filter((_, i) => i !== idx) })}
                      aria-label={`Remove ${s}`}
                  >
                      ✕
                  </button>
                </div>
              </Badge>
            );
          })}
        </div>
      </div>
    )}

      </div>
  );
}