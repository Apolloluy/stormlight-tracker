import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent,  TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, Zap, Moon, Undo2, User, Shield, EyeOff } from 'lucide-react'

import { Entity } from './Entity'
import { DEFAULT_STATUSES, DEFAULT_STATUS_ICONS } from './Status'


export default function EntityCard({ entity, onUpdate, onRemove }:{ entity:Entity, onUpdate:(id:string, patch:Partial<Entity>)=>void, onRemove:(id:string)=>void }){
  const isPlayer = entity.type==='player';
  const investitureColor = isPlayer ? 'bg-cyan-700/40' : 'bg-purple-700/40';
  const unconscious = entity.unconscious;
  const isEmpowered = entity.statuses.includes('Empowered');
  function onDragStart(e:React.DragEvent){ e.dataTransfer.setData('text/plain', entity.id); }

  // Lightning effect styles (border/glow only)
  const empoweredEffect = isEmpowered
    ? 'empowered-glow'
    : '';

  // Add keyframes and effect CSS (no SVG)
  if (typeof document !== 'undefined' && !document.getElementById('empowered-effect-style')) {
    const style = document.createElement('style');
    style.id = 'empowered-effect-style';
    style.innerHTML = `
      @keyframes empowered-lightning {
        0% { box-shadow: 0 0 16px 4px #38bdf8, 0 0 0 0 #fff0; }
        25% { box-shadow: 0 0 32px 8px #38bdf8, 0 0 8px 2px #fef08a; }
        50% { box-shadow: 0 0 24px 6px #a5f3fc, 0 0 16px 4px #fef08a; }
        75% { box-shadow: 0 0 32px 8px #38bdf8, 0 0 8px 2px #fef08a; }
        100% { box-shadow: 0 0 16px 4px #38bdf8, 0 0 0 0 #fff0; }
      }
      .empowered-glow {
        animation: empowered-lightning 1.2s infinite;
        box-shadow: 0 0 24px 6px #38bdf8, 0 0 8px 2px #fef08a;
        border: 2px solid #38bdf8;
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`${unconscious ? 'opacity-50 grayscale' : ''} ${investitureColor} border border-slate-700/60 rounded-2xl p-3 hover:outline shadow-[0_0_30px_rgba(56,189,248,0.2)] outline-cyan-400/40 ${empoweredEffect}`}
      aria-label={`${entity.name} card`}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {/* Line 1: Icon, Name, Speed */}
      <div className="flex items-center gap-2 mb-1">
        <div className="font-semibold text-slate-100">{entity.name}</div>
      </div>

      {/* Line 2: Effect Icons and +Add button floated right */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex items-center gap-1 flex-grow">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={()=>onUpdate(entity.id,{ speed: entity.speed==='fast'?'slow':'fast' })} aria-label="Toggle speed">
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
          {entity.statuses.map((s, idx) => (
            <Badge key={`${s}-${idx}`} className="bg-slate-800/70 border-slate-600/60">
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
          ))}
        </div>
      </div>
    )}

      </div>
  );
}