import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'


export default function AdminPanel({ storageKind, setStorageKind, highContrast, setHighContrast, dyslexiaMode, setDyslexiaMode }:{ storageKind:'local'|'session', setStorageKind:(v:'local'|'session')=>void, highContrast:boolean, setHighContrast:(v:boolean)=>void, dyslexiaMode:boolean, setDyslexiaMode:(v:boolean)=>void }){
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600/60"><Settings className="mr-1 size-4"/></Button>
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
