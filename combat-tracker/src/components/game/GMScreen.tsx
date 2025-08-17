
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    fetch(`/src/combatants/encounter/${fileName}.json`)
      .then(res => res.json())
      .then(data => {
        setCombatants(data);
        // Initialize counters state
        const initial = {};
        data.forEach(c => {
          initial[c.id] = { ...c.counters };
        });
        setCounters(initial);
        console.log('Loaded combatants:', data);
        console.log('Loaded combatants:', initial);
        // Load unique combatant types
        const types = Array.from(new Set(data.map(c => c.combatant_type)));
        Promise.all(
          types.map(type => fetch(`/src/combatants/catalogue/${type}.json`).then(r => r.json().then(j => [type, j])))
        ).then(results => {
          const catObj = {};
          results.forEach(([type, obj]) => { catObj[type] = obj; });
          setCatalogue(catObj);
        });
      });
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
              <div className={`${stormBorders} ${glow} ml-4`} style={{ borderRadius: 16, padding: 8 }}>
                <CombatantAttributes key={type} type={type} data={data} />
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