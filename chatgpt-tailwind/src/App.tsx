
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, RefreshCcw, Edit3, ChevronRight, Settings, Zap, Moon, Brain, Swords, Shield, EyeOff } from 'lucide-react'

const PHASES = ['FAST_PLAYERS', 'FAST_ENEMIES', 'SLOW_PLAYERS', 'SLOW_ENEMIES'] as const
type Phase = typeof PHASES[number]

type Entity = {
  id: string
  name: string
  type: 'player'|'enemy'
  hp: number
  maxHp: number
  speed: 'fast'|'slow'
  defaultSpeed: 'fast'|'slow'
  statuses: string[]
  statusInput: string
  reactionUsed: boolean
  unconscious: boolean
  notes: string
}

const DEFAULT_STATUSES = ['Slow','Stun','Prone','Bleed','Weakened','Haste','Shielded','Silenced','Burn','Frost','Shocked']

const STORAGE_KEYS = {
  APP: 'cosmere-encounter-tracker:v1',
  SETTINGS: 'cosmere-encounter-settings:v1',
}

function getStorage(kind:'local'|'session'){ return kind==='session' ? window.sessionStorage : window.localStorage }

const appBg = 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900'
const stormBorders = 'border border-slate-700/60'
const glow = 'shadow-[0_0_30px_rgba(56,189,248,0.2)]'
const stormText = 'text-slate-100'
const accentBlue = 'focus:ring-2 focus:ring-cyan-400/80'
const dyslexiaClass = '[font-family:Inter,Atkinson_Hyperlegible,system-ui,sans-serif]'

export default function App(){
  const [entities, setEntities] = useState<Entity[]>([])
  const [round, setRound] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [storageKind, setStorageKind] = useState<'local'|'session'>('local')
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexiaMode, setDyslexiaMode] = useState(true)
  const [activeTab, setActiveTab] = useState('encounter')

  useEffect(()=>{
    try{
      const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if(rawSettings){
        const s = JSON.parse(rawSettings)
        setStorageKind(s.storageKind ?? 'local')
        setHighContrast(!!s.highContrast)
        setDyslexiaMode(s.dyslexiaMode ?? true)
      }
    }catch{}
  },[])

  useEffect(()=>{
    try{
      const store = getStorage(storageKind)
      const raw = store.getItem(STORAGE_KEYS.APP)
      if(raw){
        const data = JSON.parse(raw)
        setEntities(data.entities ?? [])
        setRound(data.round ?? 1)
        setPhaseIndex(data.phaseIndex ?? 0)
      }
    }catch{}
  },[storageKind])

  useEffect(()=>{
    try{
      const store = getStorage(storageKind)
      store.setItem(STORAGE_KEYS.APP, JSON.stringify({entities, round, phaseIndex}))
    }catch{}
  },[entities, round, phaseIndex, storageKind])

  useEffect(()=>{
    try{
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({storageKind, highContrast, dyslexiaMode}))
    }catch{}
  },[storageKind, highContrast, dyslexiaMode])

  const phase = PHASES[phaseIndex]

  const fastPlayers = useMemo(()=>entities.filter(e=>e.type==='player' && e.speed==='fast'),[entities])
  const fastEnemies = useMemo(()=>entities.filter(e=>e.type==='enemy' && e.speed==='fast'),[entities])
  const slowPlayers = useMemo(()=>entities.filter(e=>e.type==='player' && e.speed==='slow'),[entities])
  const slowEnemies = useMemo(()=>entities.filter(e=>e.type==='enemy' && e.speed==='slow'),[entities])

  function addEntity(partial: Partial<Entity> = {}){
    const id = crypto.randomUUID()
    setEntities(prev => [...prev, {
      id, name: 'New Entity', type: 'player', hp: 10, maxHp: 10,
      speed: 'fast', defaultSpeed: 'fast', statuses: [], statusInput: '',
      reactionUsed: false, unconscious: false, notes: '', ...partial
    }])
  }
  function updateEntity(id:string, patch: Partial<Entity>){ setEntities(prev=>prev.map(e=>e.id===id?{...e,...patch}:e))}
  function removeEntity(id:string){ setEntities(prev=>prev.filter(e=>e.id!==id))}
  function resetReactions(){ setEntities(prev=>prev.map(e=>({...e, reactionUsed:false})))}

  function nextPhase(){
    const next = (phaseIndex + 1) % PHASES.length
    if(next===0){
      setRound(r=>r+1)
      resetReactions()
      setEntities(prev=>prev.map(e=>({...e, speed: e.defaultSpeed})))
    }
    setPhaseIndex(next)
  }
  function prevPhase(){
    let next = phaseIndex - 1
    if(next < 0){ next = PHASES.length - 1; setRound(r=>Math.max(1, r-1))}
    setPhaseIndex(next)
  }
  function clearEncounter(){ setEntities([]); setRound(1); setPhaseIndex(0)}

  function onDrop(e:React.DragEvent, lane:string){
    const id = e.dataTransfer.getData('text/plain')
    if(!id) return
    if(lane.includes('FAST')) updateEntity(id, { speed:'fast' })
    if(lane.includes('SLOW')) updateEntity(id, { speed:'slow' })
  }
  function laneProps(lane:string){
    return { onDragOver:(e:React.DragEvent)=>e.preventDefault(), onDrop:(e:React.DragEvent)=>onDrop(e,lane) }
  }

  const laneHeaderStyle = 'text-xs uppercase tracking-wider text-cyan-300/90'
  const laneBoxStyle = `${stormBorders} ${glow} rounded-2xl p-2 min-h-[120px] bg-slate-900/60`

  return (
    <TooltipProvider>
      <div className={`${appBg} ${stormText} min-h-screen ${dyslexiaMode ? dyslexiaClass : ''} ${highContrast ? 'contrast-125' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          <div className={`flex items-center justify-between gap-2 mb-4 ${stormBorders} rounded-2xl p-3 bg-slate-950/60 ${glow}`}>
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-cyan-300" />
              <h1 className="text-lg font-semibold">Cosmere Encounter Tracker</h1>
              <Badge className="ml-1 bg-cyan-700/40">Stormlight</Badge>
              <Badge className="ml-1 bg-emerald-700/40">Lifelight</Badge>
              <Badge className="ml-1 bg-purple-700/40">Warlight</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="text-sm text-slate-300/90">Round</span>
                <Badge className="text-base px-3 py-1 bg-cyan-800/60">{round}</Badge>
                <Separator orientation="vertical" className="h-6 bg-slate-700/70" />
                <span className="text-sm text-slate-300/90">Phase</span>
                <Badge className="text-xs sm:text-sm px-2 py-1 bg-slate-800/80">
                  {phase.replace('_',' ')}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={prevPhase} className={accentBlue}>Back</Button>
                <Button onClick={nextPhase} className="bg-cyan-700/80 hover:bg-cyan-600/80">Next <ChevronRight className="ml-1 size-4"/></Button>
              </div>
              <AdminPanel storageKind={storageKind} setStorageKind={setStorageKind} highContrast={highContrast} setHighContrast={setHighContrast} dyslexiaMode={dyslexiaMode} setDyslexiaMode={setDyslexiaMode} />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-slate-900/60">
              <TabsTrigger value="encounter">Encounter</TabsTrigger>
              <TabsTrigger value="roster">Roster & Setup</TabsTrigger>
            </TabsList>
            <TabsContent value="encounter" className="mt-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-200/90 mb-2 flex items-center gap-2"><Zap className="size-4"/> Fast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <section {...laneProps('FAST_PLAYERS')} className={laneBoxStyle as any}>
                      <div className={laneHeaderStyle}><Swords className="inline size-3 mr-1"/>Players first</div>
                      <div className="mt-2 grid gap-2">
                        {fastPlayers.map(e => (<EntityCard key={e.id} entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>))}
                        {fastPlayers.length===0 && <EmptyLaneHint text="Drag or toggle a player here" />}
                      </div>
                    </section>
                    <section {...laneProps('FAST_ENEMIES')} className={laneBoxStyle as any}>
                      <div className={laneHeaderStyle}><Shield className="inline size-3 mr-1"/>Enemies</div>
                      <div className="mt-2 grid gap-2">
                        {fastEnemies.map(e => (<EntityCard key={e.id} entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>))}
                        {fastEnemies.length===0 && <EmptyLaneHint text="Drag or toggle an enemy here" />}
                      </div>
                    </section>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300/90 mb-2 flex items-center gap-2"><Moon className="size-4"/> Slow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <section {...laneProps('SLOW_PLAYERS')} className={laneBoxStyle as any}>
                      <div className={laneHeaderStyle}><Swords className="inline size-3 mr-1"/>Players</div>
                      <div className="mt-2 grid gap-2">
                        {slowPlayers.map(e => (<EntityCard key={e.id} entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>))}
                        {slowPlayers.length===0 && <EmptyLaneHint text="Drag or toggle a player here" />}
                      </div>
                    </section>
                    <section {...laneProps('SLOW_ENEMIES')} className={laneBoxStyle as any}>
                      <div className={laneHeaderStyle}><Shield className="inline size-3 mr-1"/>Enemies</div>
                      <div className="mt-2 grid gap-2">
                        {slowEnemies.map(e => (<EntityCard key={e.id} entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>))}
                        {slowEnemies.length===0 && <EmptyLaneHint text="Drag or toggle an enemy here" />}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button className="bg-cyan-800/70 hover:bg-cyan-700/70" onClick={()=>addEntity({type:'player'})}><Plus className="mr-1 size-4"/> Add Player</Button>
                <Button className="bg-purple-800/60 hover:bg-purple-700/60" onClick={()=>addEntity({type:'enemy', defaultSpeed:'slow', speed:'slow'})}><Plus className="mr-1 size-4"/> Add Enemy</Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" onClick={resetReactions}><RefreshCcw className="mr-1 size-4"/> Reset Reactions</Button>
                  </TooltipTrigger>
                  <TooltipContent>Sets everyone to 0/unused reactions</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" onClick={clearEncounter}><Trash2 className="mr-1 size-4"/> Clear</Button>
                  </TooltipTrigger>
                  <TooltipContent>Clears roster and tracker (autosave will update)</TooltipContent>
                </Tooltip>
              </div>
            </TabsContent>

            <TabsContent value="roster" className="mt-3">
              <Card className={`bg-slate-950/60 ${stormBorders}`}>
                <CardContent className="p-3">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {entities.map(e => (<RosterEditor key={e.id} entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>))}
                  </div>
                  {entities.length===0 && (<div className="text-sm text-slate-400 p-4">No entities yet. Use buttons below to add some.</div>)}
                  <div className="mt-3 flex gap-2">
                    <Button className="bg-cyan-800/70 hover:bg-cyan-700/70" onClick={()=>addEntity({type:'player'})}><Plus className="mr-1 size-4"/> Add Player</Button>
                    <Button className="bg-purple-800/60 hover:bg-purple-700/60" onClick={()=>addEntity({type:'enemy', defaultSpeed:'slow', speed:'slow'})}><Plus className="mr-1 size-4"/> Add Enemy</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}

function EmptyLaneHint({ text }:{text:string}){ return <div className="text-xs text-slate-400/90 italic px-2 py-3 rounded-xl bg-slate-800/40 border border-slate-700/40">{text}</div> }

function RosterEditor({ entity, onUpdate, onRemove }:{ entity:Entity, onUpdate:(id:string, patch:Partial<Entity>)=>void, onRemove:(id:string)=>void }){
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
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Default Speed</DropdownMenuLabel>
              <DropdownMenuItem onClick={()=>onUpdate(entity.id,{defaultSpeed:'fast'})}><Zap className="mr-2 size-4"/> Fast</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>onUpdate(entity.id,{defaultSpeed:'slow'})}><Moon className="mr-2 size-4"/> Slow</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2"><span className="text-slate-300/80 min-w-16">HP</span>
            <Input type="number" value={entity.hp} onChange={e=>onUpdate(entity.id,{hp:Number(e.target.value)})} className="bg-slate-950/60" />
          </label>
          <label className="flex items-center gap-2"><span className="text-slate-300/80 min-w-16">Max</span>
            <Input type="number" value={entity.maxHp} onChange={e=>onUpdate(entity.id,{maxHp:Number(e.target.value)})} className="bg-slate-950/60" />
          </label>
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

function EntityCard({ entity, onUpdate, onRemove }:{ entity:Entity, onUpdate:(id:string, patch:Partial<Entity>)=>void, onRemove:(id:string)=>void }){
  const isPlayer = entity.type==='player'
  const investitureColor = isPlayer ? 'bg-cyan-700/40' : 'bg-purple-700/40'
  const unconscious = entity.unconscious
  function onDragStart(e:React.DragEvent){ e.dataTransfer.setData('text/plain', entity.id) }
  return (
    <div draggable onDragStart={onDragStart} className={`${unconscious ? 'opacity-50 grayscale' : ''} ${investitureColor} border border-slate-700/60 rounded-2xl p-3 hover:outline shadow-[0_0_30px_rgba(56,189,248,0.2)] outline-cyan-400/40`} aria-label={`${entity.name} card`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPlayer ? <Swords className="size-4 text-cyan-300"/> : <Shield className="size-4 text-purple-300"/>}
          <span className="font-semibold text-slate-100">{entity.name}</span>
          <Badge className="border-slate-500/60 text-slate-200/90">{entity.speed.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-1">
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
                <Brain className={`size-4 ${entity.reactionUsed?'text-yellow-300':'text-slate-400'}`}/>
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
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div className="col-span-2 flex items-center gap-2">
          <span className="text-slate-300/80">HP</span>
          <Input type="number" className="h-8" value={entity.hp} onChange={(e)=>onUpdate(entity.id,{hp:Number(e.target.value)})} aria-label="HP" />
          <span className="text-slate-400">/</span>
          <Input type="number" className="h-8" value={entity.maxHp} onChange={(e)=>onUpdate(entity.id,{maxHp:Number(e.target.value)})} aria-label="Max HP" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge className={`px-2 ${entity.reactionUsed ? 'bg-yellow-700/40':'bg-slate-700/40'}`}>{entity.reactionUsed ? 'Reaction: Used' : 'Reaction: Ready'}</Badge>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-300/70">Status & Investiture</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary"><Plus className="mr-1 size-4"/> Add</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900/95 border-slate-700/70 max-h-64 overflow-y-auto">
              {DEFAULT_STATUSES.map(s => (<DropdownMenuItem key={s} onClick={()=>onUpdate(entity.id,{statuses:[...entity.statuses, s]})}>{s}</DropdownMenuItem>))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {entity.statuses.map((s, idx)=>(
            <Badge key={`${s}-${idx}`} className="bg-slate-800/70 border-slate-600/60">
              {s}
              <button className="ml-2 text-xs opacity-70 hover:opacity-100" onClick={()=>onUpdate(entity.id,{statuses: entity.statuses.filter((_,i)=>i!==idx)})} aria-label={`Remove ${s}`}>✕</button>
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input placeholder="Custom effect (e.g., Stormlight: 2 charges)" value={entity.statusInput} onChange={(e)=>onUpdate(entity.id,{statusInput:e.target.value})} className="h-9" />
          <Button onClick={()=>{ if(!entity.statusInput.trim()) return; onUpdate(entity.id,{statuses:[...entity.statuses, entity.statusInput.trim()], statusInput:''})}} className="bg-emerald-700/60 hover:bg-emerald-600/60">Add</Button>
        </div>
      </div>
    </div>
  )
}

function AdminPanel({ storageKind, setStorageKind, highContrast, setHighContrast, dyslexiaMode, setDyslexiaMode }:{ storageKind:'local'|'session', setStorageKind:(v:'local'|'session')=>void, highContrast:boolean, setHighContrast:(v:boolean)=>void, dyslexiaMode:boolean, setDyslexiaMode:(v:boolean)=>void }){
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600/60"><Settings className="mr-1 size-4"/> Admin</Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950/95 border-slate-700/70">
        <DialogHeader>
          <DialogTitle>Admin & Accessibility</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
            <div className="text-sm font-semibold text-cyan-300">Storage</div>
            <div className="text-xs text-slate-300/80 mt-1">Choose where autosave persists your encounter.</div>
            <div className="mt-2 flex items-center gap-3">
              <Button variant={storageKind==='local'?'default':'secondary'} onClick={()=>setStorageKind('local')} className="bg-cyan-800/70 hover:bg-cyan-700/70">Local Storage</Button>
              <Button variant={storageKind==='session'?'default':'secondary'} onClick={()=>setStorageKind('session')} className="bg-purple-800/60 hover:bg-purple-700/60">Session Storage</Button>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
            <div className="text-sm font-semibold text-cyan-300">Accessibility</div>
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-700/60">
                <span className="text-sm">High Contrast</span>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </label>
              <label className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-700/60">
                <span className="text-sm">Dyslexia-friendly font</span>
                <Switch checked={dyslexiaMode} onCheckedChange={setDyslexiaMode} />
              </label>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Tip: Players always act before enemies in each phase. Phases cycle Fast→Slow automatically; reactions reset at the start of each new round.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
