
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadAllContent, findBySlug } from '@/lib/contentLoader'
import EntityCard from '../game/EntityCard';
import { Combatant } from '../combatant/Combatant';
import CombatantCard from '../combatant/CombatantCard';
import CombatantAttributes from '../combatant/CombatantAttributes';
import { appBg, stormBorders, stormText, glow, accentBlue, dyslexiaClass } from '../../styles/AppStyles'

const sectionStyle = {
  borderBottom: '4px solid #FFD600', // yellow bar
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
};

const GMScreen = () => {
  const { fileName } = useParams();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [counters, setCounters] = useState<Record<string, any>>({});
  const [catalogue, setCatalogue] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!fileName) return;
    // Try to load via unified content loader (supports migrated content and legacy folders)
    (async () => {
      try {
        const item = await findBySlug('encounter', fileName as string);
        let data: any = null;
        let allItems: any[] = [];
        if (item) {
          data = item.data;
          // Also load all other content for catalogue lookups
          allItems = await loadAllContent();
          console.log('[debug] GMScreen loadAllContent items count', allItems.length, 'sampleCombatantSlugs', allItems.filter(i=>i.kind==='combatant').slice(0,10).map(i=>i.slug));
        } else {
          // Fallback to legacy path
          const res = await fetch(`/src/combatants/encounter/${fileName}.json`);
          data = await res.json();
          allItems = await loadAllContent();
          console.log('[debug] GMScreen loadAllContent items count', allItems.length, 'sampleCombatantSlugs', allItems.filter(i=>i.kind==='combatant').slice(0,10).map(i=>i.slug));
        }
        if (!data) return;
        // `data` may be an array of combatants (legacy) or an object with `combatants` (merged format)
        const resolvedCombatants = Array.isArray(data) ? data : (data?.combatants ?? []);
        setCombatants(resolvedCombatants);
        // Initialize counters state
        const initial = {};
        resolvedCombatants.forEach((c: any) => {
          initial[c.id] = { ...c.counters };
        });
        setCounters(initial);
        console.log('Loaded resolvedCombatants:', resolvedCombatants);
        console.log('Initial counters:', initial);
        // Load unique combatant types (try to find catalogue entries via content loader first)
        const types = Array.from(new Set(resolvedCombatants.map((c: any) => c.combatant_type)));
        const catalogueResults = await Promise.all(types.map(async type => {
          // Try to find a catalogue item from loaded items
          const catItem = allItems.find(i => i.kind === 'combatant' && (i.slug === type || i.fullPath.endsWith(`${type}.json`)));
          if (catItem) {
            console.log('[debug] GMScreen found catalogue item for', type, 'from', catItem.fullPath);
            return [type, catItem.data];
          }
          // Fallback to legacy fetch
          try {
            const r = await fetch(`/src/combatants/catalogue/${type}.json`);
            const j = await r.json();
            return [type, j];
          } catch (err) {
            console.warn('Failed to load catalogue for', type, err);
            return [type, {}];
          }
        }));
        const catObj: Record<string, any> = {};
        catalogueResults.forEach(([type, obj]) => { catObj[type as string] = obj; });
        setCatalogue(catObj as Record<string, any>);
      } catch (err) {
        console.warn('GMScreen load error', err);
      }
    })();
  }, [fileName]);

  const handleCounterChange = (id, counter, value) => {
    setCounters(prev => ({
      ...prev,
      [id]: { ...prev[id], [counter]: value }
    }));
  };

  const handleToggleActive = (name) => {
    console.log('Toggling active state for:', name);
    setCombatants(prev => prev.map(c => c.name === name ? { ...c, active: !c.active } : c));
  };

  const activeCombatants = combatants.filter(c => c.active !== false);
  const inactiveCombatants = combatants.filter(c => c.active === false);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%', background: 'rgba(24,31,58,0.96)', position: 'relative' }}>
        {/* App Bar */}
        <div className={`${appBg} ${stormText} min-h-screen`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
                <div className={`flex items-center justify-between gap-2 mb-4 ${stormBorders} rounded-2xl p-3 bg-slate-950/60 ${glow}`}>
                    <div className="flex items-center gap-2">
                        <img src="/favicon.ico" width="30" />
                        <h1 className="text-lg font-semibold">Cosmere Encounter Tracker: {fileName}</h1>
                    </div>
                </div>
          </div>
       
        {/* Active Combatants */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          {activeCombatants.map(c => (
              <CombatantCard
                key={c.id}
                combatant={c}
                counters={counters[c.id]}
                onCounterChange={(counter, value) => handleCounterChange(c.id, counter, value)}
                onToggleActive={() => handleToggleActive(c.name)}
                inactive={false}
              />
          ))}
        </div>
        
        {/* Unique Combatant Types Section */}
        <div style={{ marginTop: 48 }}>
          <h2 className={`ml-4`} style={{ color: '#43ea7a', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Combatant Types</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            {Object.entries(catalogue).map(([type, data]) => (
              <div key={type} className={`${stormBorders} ${glow} ml-4`} style={{ borderRadius: 16, padding: 8 }}>
                <CombatantAttributes type={type} data={data} />
              </div>
            ))}
          </div>
        </div>
        {/* Inactive Combatants */}
        {inactiveCombatants.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ color: '#6c3ad2', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Inactive</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              {inactiveCombatants.map(c => (
                  <CombatantCard
                    key={c.id}
                    combatant={c}
                    counters={counters[c.id]}
                    onCounterChange={(counter, value) => handleCounterChange(c.id, counter, value)}
                    onToggleActive={() => handleToggleActive(c.name)}
                    inactive={true}
                  />
              ))}
            </div>
          </div>
        )}
      </div>
       </div>
    </div>
  );
}

export default GMScreen;