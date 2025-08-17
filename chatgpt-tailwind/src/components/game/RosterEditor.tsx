import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit3, Zap, Moon, Swords, Shield } from 'lucide-react'

import { Entity } from './Entity'

export default function RosterEditor({ entity, onUpdate, onRemove }:{ entity:Entity, onUpdate:(id:string, patch:Partial<Entity>)=>void, onRemove:(id:string)=>void }){
  return (
    <Card className="bg-slate-900/70 border-slate-700/70">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-2">
          <Input value={entity.name} onChange={(e)=>onUpdate(entity.id,{name:e.target.value})} className="bg-slate-950/60" aria-label="Entity name" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Change type"><Edit3 className="size-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900/90 border-slate-700/70">
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              <DropdownMenuItem onClick={()=>onUpdate(entity.id,{type:'player'})}><Swords className="mr-2 size-4"/> Player</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>onUpdate(entity.id,{type:'enemy'})}><Shield className="mr-2 size-4"/> Enemy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-300/80">Unconscious</span>
          <Switch checked={entity.unconscious} onCheckedChange={(v)=>onUpdate(entity.id,{unconscious:v})} />
        </div>
        <div className="mt-3">
          <label className="text-sm text-slate-300/80">Notes</label>
          <textarea className="w-full mt-1 rounded-xl bg-slate-950/60 p-2 border border-slate-700/60" rows={3} value={entity.notes} onChange={(e)=>onUpdate(entity.id,{notes:e.target.value})} />
        </div>
      </CardContent>
    </Card>
  )
}
