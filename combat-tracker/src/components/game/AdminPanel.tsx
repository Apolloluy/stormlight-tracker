import React from 'react'
import { loadAllContent } from '@/lib/contentLoader'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
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

  const [playersUrl, setPlayersUrl] = React.useState<string>('');
  React.useEffect(() => {
    // Load all content (from new unified `src/content` or legacy folders)
    loadAllContent().then(items => {
      const encounterItems = items.filter(i => i.kind === 'encounter');
      const grouped: Record<string, {name: string, path: string}[]> = {};
      encounterItems.forEach(it => {
        if (it.fullPath.endsWith('players.json')) {
          setPlayersUrl(it.url);
          return;
        }
        const parts = it.fullPath.split('/');
        const folder = parts[parts.length - 2] || 'root';
        const name = parts[parts.length - 1] || it.slug + '.json';
        if (!grouped[folder]) grouped[folder] = [];
        grouped[folder].push({ name, path: it.url });
      });
      setEncounterFiles(Object.entries(grouped).map(([folder, files]) => ({ folder, files })));
    
      console.log('[debug] AdminPanel encounter groups', Object.entries(grouped).map(([folder, files]) => ({ folder, filesCount: files.length })));
    }).catch(err => console.warn('loadAllContent error', err));
  }, []);

  async function handleLoadEncounter() {
    if (!selectedFile) return;
    try {
      // Extract file name from selectedFile path
      const fileNameMatch = selectedFile.match(/([^/]+)\.json$/);
      const fileName = fileNameMatch ? fileNameMatch[1] : '';
      if (fileName) {
        window.open(`/gm-screen/${fileName}`, '_blank', 'noopener');
      }
      // ...existing code for loading entities...
      // Fetch encounter file and players via the content loader's results
      let encounterEntities: any[] = [];
      let playerEntities: any[] = [];
      try {
        const res = await fetch(selectedFile);
        const json = await res.json();
        // json may be either an array of combatants (legacy) or an object with a `combatants` array (merged format)
        if (Array.isArray(json)) encounterEntities = json;
        else if (json && Array.isArray(json.combatants)) encounterEntities = json.combatants;
        else encounterEntities = [];
        console.log('[debug] AdminPanel fetched encounterEntities count', encounterEntities.length, 'from', selectedFile);
      } catch (err) {
        console.warn('Failed to fetch encounter file directly, trying content loader', err);
      }
      if (playersUrl) {
        try {
          const pres = await fetch(playersUrl);
          const pj = await pres.json();
          playerEntities = Array.isArray(pj) ? pj : (pj?.players ?? []);
        } catch (err) {
          console.warn('Failed to fetch players.json', err);
        }
      }
      // If the fetched encounter JSON was the merged format, it may have a `scene` array
      // that provides lightweight `type` and `speed` hints. Merge those into the
      // detailed `combatants` entries so the App can classify them correctly.
      let normalizedEncounterEntities = encounterEntities;
      try {
        const res2 = await fetch(selectedFile);
        const full = await res2.json();
        const scene = full?.scene;
        if (Array.isArray(scene) && Array.isArray(encounterEntities)) {
          // Prefer using the `scene` section as the source of truth for UI fields
          // such as `name`, `type`, `speed`, and `icon`. We will merge detailed
          // combatant data (counters, combatant_type, id) into the scene entries.
          if (scene.length === encounterEntities.length) {
            normalizedEncounterEntities = scene.map((s: any, i: number) => {
              const e = encounterEntities[i] || {};
              const rawIcon = s.icon || e.icon || '';
              let iconPath = rawIcon;
              if (rawIcon && !rawIcon.startsWith('/') && !rawIcon.startsWith('http') && !rawIcon.startsWith('data:')) {
                if (!rawIcon.includes('/icons/')) iconPath = `/src/icons/${rawIcon}`;
                else iconPath = rawIcon.startsWith('src/') ? `/${rawIcon}` : `/${rawIcon}`;
              }
              return {
                // Scene provides display fields
                name: s.name,
                type: s.type || e.type || (e.combatant_type ? 'enemy' : 'player'),
                speed: s.speed || e.speed || 'slow',
                icon: iconPath || undefined,
                // Include combatant-specific details
                id: e.id || (s.id ? s.id : undefined),
                combatant_type: e.combatant_type,
                counters: e.counters || {},
                active: e.active ?? true,
                statuses: e.statuses ?? [],
                notes: e.notes ?? ''
              };
            });
          } else {
            // Fallback: when lengths differ, include all `scene` entries (even if
            // they don't have a corresponding combatant) and merge in combatant
            // details when a name match is found. Also include unmatched combatant
            // entries so nothing is lost.
            const sceneByName: Record<string, any> = {};
            scene.forEach((s: any) => { if (s && s.name) sceneByName[s.name] = s; });

            const usedCombatants = new Set();
            const merged: any[] = [];

            // First, add all scene entries (primary source of display fields)
            scene.forEach((s: any) => {
              const match = encounterEntities.find((e: any) => e && e.name === s.name);
              if (match) usedCombatants.add(match.id ?? match.name ?? JSON.stringify(match));
              const e = match || {};
              const rawIcon = s.icon || e.icon || '';
              let iconPath = rawIcon;
              if (rawIcon && !rawIcon.startsWith('/') && !rawIcon.startsWith('http') && !rawIcon.startsWith('data:')) {
                if (!rawIcon.includes('/icons/')) iconPath = `/src/icons/${rawIcon}`;
                else iconPath = rawIcon.startsWith('src/') ? `/${rawIcon}` : `/${rawIcon}`;
              }
              merged.push({
                name: s.name,
                type: s.type || e.type || (e.combatant_type ? 'enemy' : 'player'),
                speed: s.speed || e.speed || 'slow',
                icon: iconPath || undefined,
                id: e.id || (s.id ? s.id : undefined),
                combatant_type: e.combatant_type,
                counters: e.counters || {},
                active: e.active ?? true,
                statuses: e.statuses ?? [],
                notes: e.notes ?? ''
              });
            });

            // Then add any combatants that didn't match a scene entry
            encounterEntities.forEach((e: any) => {
              const key = e.id ?? e.name ?? JSON.stringify(e);
              if (usedCombatants.has(key)) return;
              const rawIcon = e.icon || '';
              let iconPath = rawIcon;
              if (rawIcon && !rawIcon.startsWith('/') && !rawIcon.startsWith('http') && !rawIcon.startsWith('data:')) {
                if (!rawIcon.includes('/icons/')) iconPath = `/src/icons/${rawIcon}`;
                else iconPath = rawIcon.startsWith('src/') ? `/${rawIcon}` : `/${rawIcon}`;
              }
              merged.push({
                ...e,
                name: e.name,
                icon: iconPath || undefined,
                type: e.type || (e.combatant_type ? 'enemy' : 'player'),
                speed: e.speed || 'slow'
              });
            });

            // Prioritize bosses at the front of the list while preserving relative order
            const bosses = merged.filter(i => i.type === 'boss');
            const others = merged.filter(i => i.type !== 'boss');
            normalizedEncounterEntities = [...bosses, ...others];
            console.log('[debug] AdminPanel merged scene/combatant counts', { sceneCount: scene.length, combatantCount: encounterEntities.length, normalizedCount: normalizedEncounterEntities.length, bosses: bosses.length });
          }
        }
      } catch (err) {
        // ignore; we already logged earlier if fetch failed
      }

      // Combine and send to App
      onLoadEntities([...playerEntities, ...normalizedEncounterEntities]);
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
          <DialogDescription>Controls for loading encounters and accessibility settings.</DialogDescription>
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
