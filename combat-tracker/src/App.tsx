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
import { Plus, Trash2, RefreshCcw, Edit3, ChevronRight, ArrowRightToLine, ArrowLeftToLine, Settings, Zap, Moon, Brain, User, Shield, EyeOff } from 'lucide-react'

import { appBg, stormBorders, stormText, glow, accentBlue, dyslexiaClass } from './styles/AppStyles'

import EntityCard from './components/game/EntityCard'
import AdminPanel from './components/game/AdminPanel'
import RosterEditor from './components/game/RosterEditor'
import { Entity } from './components/game/Entity'


const PHASES = ['FAST_PLAYERS', 'FAST_ENEMIES', 'SLOW_PLAYERS', 'SLOW_ENEMIES'] as const
type Phase = typeof PHASES[number]



const STORAGE_KEYS = {
  APP: 'cosmere-encounter-tracker:v1',
  SETTINGS: 'cosmere-encounter-settings:v1',
}

function getStorage(kind:'local'|'session'){ return kind==='session' ? window.sessionStorage : window.localStorage }



export default function App(){
  const [entities, setEntities] = useState<Entity[]>([])
  // Callback for AdminPanel to load entities from encounter files
  function handleLoadEntities(newEntities: Entity[]) {
    const normalized = newEntities.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      statuses: e.statuses ?? [],
      statusInput: '',
      reactionUsed: false,
      unconscious: false,
      notes: e.notes ?? ''
    }));
    console.log('[debug] handleLoadEntities normalized count', normalized.length, 'sample:', normalized.map(x=>({name:x.name,type:x.type,speed:x.speed})).slice(0,10));
    setEntities(normalized);
  }
  const [round, setRound] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [storageKind, setStorageKind] = useState<'local'|'session'>('local')
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexiaMode, setDyslexiaMode] = useState(true)
  const [activeTab, setActiveTab] = useState('encounter')
  // Dash animation state
  const [dashingEntity, setDashingEntity] = useState<{id: string, to: 'fast'|'slow'}|null>(null);

  // Listen for dash event
  useEffect(() => {
    function handleDashEvent(e: any) {
      const { id, to } = e.detail;
      setDashingEntity({ id, to });
      setTimeout(() => {
        setDashingEntity(null);
        updateEntity(id, { speed: to });
      }, 300); // Animation duration
    }
    window.addEventListener('entityDash', handleDashEvent);
    return () => window.removeEventListener('entityDash', handleDashEvent);
  }, [entities]);
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
  const bosses = useMemo(() => entities.filter(e => e.type === 'boss'), [entities]);

  const fastEnemies = useMemo(() => [
    ...bosses,
    ...entities.filter(e => (e.type === 'enemy' || e.type === 'ally') && e.speed === 'fast')
  ], [entities, bosses]);
  const slowPlayers = useMemo(()=>entities.filter(e=>e.type==='player' && e.speed==='slow'),[entities])
  const slowEnemies = useMemo(() => [
    ...bosses,
    ...entities.filter(e => (e.type === 'enemy' || e.type === 'ally') && e.speed === 'slow')
  ], [entities, bosses]);

  function addEntity(partial: Partial<Entity> = {}){
    const id = crypto.randomUUID()
    setEntities(prev => [...prev, {
      id, name: 'New Entity', type: 'player',
      speed: 'fast', statuses: [], statusInput: '',
      reactionUsed: false, unconscious: false, notes: '', ...partial
    }])
  }
  function updateEntity(id:string, patch: Partial<Entity>){ setEntities(prev=>prev.map(e=>e.id===id?{...e,...patch}:e))}
  function removeEntity(id:string){ setEntities(prev=>prev.filter(e=>e.id!==id))}
  function resetReactions(){ setEntities(prev=>prev.map(e=>({...e, reactionUsed:false})))}

  function phaseHasEntities(phase: Phase) {
    switch (phase) {
      case 'FAST_PLAYERS': return fastPlayers.length > 0;
      case 'FAST_ENEMIES': return fastEnemies.length > 0;
      case 'SLOW_PLAYERS': return slowPlayers.length > 0;
      case 'SLOW_ENEMIES': return slowEnemies.length > 0;
      default: return false;
    }
  }

  function nextPhase() {
    let next = (phaseIndex + 1) % PHASES.length;
    let looped = false;
    // Always allow FAST_PLAYERS, otherwise skip empty phases
    while (PHASES[next] !== 'FAST_PLAYERS' && !phaseHasEntities(PHASES[next])) {
      next = (next + 1) % PHASES.length;
      if (next === phaseIndex) { looped = true; break; }
    }
    if (next === 0) {
      setRound(r => r + 1);
      resetReactions();
    }
    setPhaseIndex(next);
  }

  function prevPhase() {
    let next = phaseIndex - 1;
    if (next < 0) next = PHASES.length - 1;
    let looped = false;
    // Always allow FAST_PLAYERS, otherwise skip empty phases
    while (PHASES[next] !== 'FAST_PLAYERS' && !phaseHasEntities(PHASES[next])) {
      next = next - 1;
      if (next < 0) next = PHASES.length - 1;
      if (next === phaseIndex) { looped = true; break; }
    }
    if (next > phaseIndex) {
      setRound(r => Math.max(1, r - 1));
    }
    setPhaseIndex(next);
  }

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
const laneBoxStyle = `border rounded-2xl p-2 min-h-[120px] bg-slate-900/60 ${glow}`;

  return (
    <TooltipProvider>
      <div className={`${appBg} ${stormText} min-h-screen ${dyslexiaMode ? dyslexiaClass : ''} ${highContrast ? 'contrast-125' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          <div className={`flex items-center justify-between gap-2 mb-4 ${stormBorders} rounded-2xl p-3 bg-slate-950/60 ${glow}`}>
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" width="30" />
              <h1 className="text-lg font-semibold">Cosmere Encounter Tracker</h1>
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
                <Button variant="secondary" onClick={prevPhase} className={accentBlue}><ArrowLeftToLine className="ml-1 size-4"/></Button>
                <Button onClick={nextPhase} className="bg-cyan-700/80 hover:bg-cyan-600/80"><ArrowRightToLine className="ml-1 size-4"/></Button>
              </div>
              <AdminPanel
                storageKind={storageKind}
                setStorageKind={setStorageKind}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                dyslexiaMode={dyslexiaMode}
                setDyslexiaMode={setDyslexiaMode}
                onLoadEntities={handleLoadEntities}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            
            <TabsContent value="encounter" className="mt-3">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-200/90 mb-2 flex items-center gap-2"><Zap className="size-4"/> Fast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <section
                      {...laneProps('FAST_PLAYERS')}
                      className={
                        laneBoxStyle +
                        (phase === 'FAST_PLAYERS' ? ' border-2 border-cyan-400 bg-cyan-900/30' : '')
                      }
                    >
                      <div className={laneHeaderStyle}><User className="inline size-3 mr-1"/>Players</div>
                      <div className="mt-2 grid gap-2">
                        {fastPlayers.map(e => (
                          <div key={e.id} style={{ position: 'relative' }}>
                            <EntityCard entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>
                            {dashingEntity && dashingEntity.id === e.id && dashingEntity.to === 'slow' && (
                              <div className="absolute inset-0 pointer-events-none z-50 animate-dash-lightning">
                                <svg width="100%" height="100%" viewBox="0 0 120 60" fill="none">
                                  <polyline points="10,30 40,10 80,50 110,30" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                                  <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                      <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                      </feMerge>
                                    </filter>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    <section
                      {...laneProps('FAST_ENEMIES')}
                      className={
                        laneBoxStyle +
                        (phase === 'FAST_ENEMIES' ? ' border-2 border-purple-400 bg-purple-900/30' : '')
                      }
                    >
                      <div className={laneHeaderStyle}><Shield className="inline size-3 mr-1"/>Enemies & NPCs</div>
                      <div className="mt-2 grid gap-2">
                        {fastEnemies.map(e => (
                          <div key={e.id} style={{ position: 'relative' }}>
                            <EntityCard entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>
                            {dashingEntity && dashingEntity.id === e.id && dashingEntity.to === 'slow' && (
                              <div className="absolute inset-0 pointer-events-none z-50 animate-dash-lightning">
                                <svg width="100%" height="100%" viewBox="0 0 120 60" fill="none">
                                  <polyline points="10,30 40,10 80,50 110,30" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                                  <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                      <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                      </feMerge>
                                    </filter>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300/90 mb-2 flex items-center gap-2"><Moon className="size-4"/> Slow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <section
                      {...laneProps('SLOW_PLAYERS')}
                      className={
                        laneBoxStyle +
                         (phase === 'SLOW_PLAYERS' ? ' border-2 border-emerald-400 bg-emerald-900/30' : '')
                      }
                    >
                      <div className={laneHeaderStyle}><User className="inline size-3 mr-1"/>Players</div>
                      <div className="mt-2 grid gap-2">
                        {slowPlayers.map(e => (
                          <div key={e.id} style={{ position: 'relative' }}>
                            <EntityCard entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>
                            {dashingEntity && dashingEntity.id === e.id && dashingEntity.to === 'fast' && (
                              <div className="absolute inset-0 pointer-events-none z-50 animate-dash-lightning">
                                <svg width="100%" height="100%" viewBox="0 0 120 60" fill="none">
                                  <polyline points="110,30 80,10 40,50 10,30" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                                  <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                      <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                      </feMerge>
                                    </filter>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    <section
                      {...laneProps('SLOW_ENEMIES')}
                      className={
                        laneBoxStyle +
                        (phase === 'SLOW_ENEMIES' ? ' border-2 border-fuchsia-400 bg-fuchsia-900/30' : '')
                      }
                    >
                      <div className={laneHeaderStyle}><Shield className="inline size-3 mr-1"/>Enemies & NPCs</div>
                      <div className="mt-2 grid gap-2">
                        {slowEnemies.map(e => (
                          <div key={e.id} style={{ position: 'relative' }}>
                            <EntityCard entity={e} onUpdate={updateEntity} onRemove={removeEntity}/>
                            {dashingEntity && dashingEntity.id === e.id && dashingEntity.to === 'fast' && (
                              <div className="absolute inset-0 pointer-events-none z-50 animate-dash-lightning">
                                <svg width="100%" height="100%" viewBox="0 0 120 60" fill="none">
                                  <polyline points="110,30 80,10 40,50 10,30" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                                  <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                      <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                      </feMerge>
                                    </filter>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
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
                    <Button className="bg-cyan-800/70 hover:bg-cyan-700/70 flex flex-row items-center" onClick={()=>addEntity({type:'player'})}>
                      <Plus className="mr-1 size-4"/> <span>Player</span>
                    </Button>
                    <Button className="bg-purple-800/60 hover:bg-purple-700/60 flex flex-row items-center" onClick={()=>addEntity({type:'enemy', speed:'slow'})}>
                      <Plus className="mr-1 size-4"/> <span>Enemy</span>
                    </Button>
                    <Button className="bg-green-800/60 hover:bg-green-700/60 flex flex-row items-center" onClick={()=>addEntity({type:'ally', speed:'slow'})}>
                      <Plus className="mr-1 size-4"/> <span>Ally</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-slate-900/60 mt-6">
              <TabsTrigger value="encounter">Encounter</TabsTrigger>
              <TabsTrigger value="roster">Roster & Setup</TabsTrigger>
            </TabsList>
            <div className="mt-6 flex flex-wrap items-center gap-2 mb-4">
              <Button className="bg-cyan-800/70 hover:bg-cyan-700/70 flex flex-row items-center" onClick={()=>addEntity({type:'player'})}>
                <Plus className="mr-1 size-4"/> <span>Player</span>
              </Button>
              <Button className="bg-purple-800/60 hover:bg-purple-700/60 flex flex-row items-center" onClick={()=>addEntity({type:'enemy', speed:'slow'})}>
                <Plus className="mr-1 size-4"/> <span>Enemy</span>
              </Button>
              <Button className="bg-green-800/60 hover:bg-green-700/60 flex flex-row items-center" onClick={()=>addEntity({type:'ally', speed:'slow'})}>
                <Plus className="mr-1 size-4"/> <span>Ally</span>
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
