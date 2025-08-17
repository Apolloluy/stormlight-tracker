import React from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'


interface AdminPanelProps {
  storageKind: 'local' | 'session';
  setStorageKind: (v: 'local' | 'session') => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  dyslexiaMode: boolean;
  setDyslexiaMode: (v: boolean) => void;
  onLoadEntities: (entities: any[]) => void;
}

export default function AdminPanel({ storageKind, setStorageKind, highContrast, setHighContrast, dyslexiaMode, setDyslexiaMode, onLoadEntities }: AdminPanelProps) {
  // Dynamic encounter file list from project folder
  const [encounterFiles, setEncounterFiles] = React.useState<{folder: string, files: {name: string, path: string}[]}[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<string>('');

  React.useEffect(() => {
    // This uses Vite's import.meta.glob to get all encounter files at build time
    // Only works in Vite/webpack environments
    // Filter out players.json and group by folder
    // @ts-ignore
    const files = (import.meta as any).glob('/src/encounters/**/*.json', { eager: true, as: 'url' });
    const grouped: Record<string, {name: string, path: string}[]> = {};
    Object.entries(files).forEach(([fullPath, url]) => {
      if (fullPath.endsWith('players.json')) return;
      // Extract folder and file name
      const parts = fullPath.split('/');
      const folder = parts[parts.length - 2];
      const name = parts[parts.length - 1];
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push({ name, path: url as string });
    });
    setEncounterFiles(Object.entries(grouped).map(([folder, files]) => ({ folder, files })));
  }, []);

  async function handleLoadEncounter() {
    if (!selectedFile) return;
    try {
      // Use import.meta.glob to get all JSON file URLs
      // @ts-ignore
      const files = (import.meta as any).glob('/src/encounters/**/*.json', { eager: true, as: 'url' });
      // Find the players.json URL
      let playersUrl = '';
      Object.entries(files).forEach(([fullPath, url]) => {
        if (fullPath.endsWith('players.json')) {
          playersUrl = url as string;
        }
      });
      // Fetch encounter file
      const encounterRes = await fetch(selectedFile);
      console.log('Encounter data:', encounterRes);
      const encounterEntities = await encounterRes.json();
      // Fetch players.json from the same source
      if (!playersUrl) throw new Error('players.json not found');
      const playersRes = await fetch(playersUrl);
      console.log('Players data:', playersRes);
      const playerEntities = await playersRes.json();
      // Combine and send to App
      onLoadEntities([...playerEntities, ...encounterEntities]);
    } catch (err) {
      alert('Failed to load encounter: ' + err);
    }
  }

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
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
            <div className="text-sm font-semibold text-cyan-300 mb-2">Load Encounter</div>
            <div className="grid gap-2">
              <select className="p-2 rounded-lg bg-slate-950/50 border border-slate-700/60 text-slate-200" value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                <option value="">Select encounter...</option>
                {encounterFiles.map(group => (
                  <optgroup key={group.folder} label={group.folder}>
                    {group.files.map(file => (
                      <option key={file.path} value={file.path}>{file.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Button className="bg-cyan-800/70 hover:bg-cyan-700/70" onClick={handleLoadEncounter} disabled={!selectedFile}>Load Encounter</Button>
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
