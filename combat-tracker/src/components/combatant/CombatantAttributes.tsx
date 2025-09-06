import React, { useState } from 'react';
import { Combatant } from './Combatant';
import { appBg, stormBorders, stormText, glow, accentBlue, dyslexiaClass } from '../../styles/AppStyles'


const sectionStyle = {
  borderBottom: '4px solid #FFD600',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
};

const Section = ({ title, children }) => {
  const [minimized, setMinimized] = useState(true);
  return (
    <div style={sectionStyle}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setMinimized(m => !m)}>
        <strong>{title}</strong>
        <span style={{ marginLeft: 'auto' }}>{minimized ? '+' : '-'}</span>
      </div>
      {!minimized && <div>{children}</div>}
    </div>
  );
};

type Defenses = {
    physical: number;
    cognitive: number;
    spiritual: number;
}

function computeDefense(stats) {
  return {
    physical: 10 + stats.physical.strength + stats.physical.speed,
    cognitive: 10 + stats.cognitive.intelligence + stats.cognitive.willpower,
    spiritual: 10 + stats.spiritual.awareness + stats.spiritual.presence,
  };
}


const CombatantAttributes = ({ type, data  }) => {
  const defense : Defenses = data.stats ? computeDefense(data.stats) : { physical: 0, cognitive: 0, spiritual: 0 };
  return (
    <div style={{ border: '2px solid #FFD600', borderRadius: 12, padding: 20, color: '#FFD600', maxWidth: 420, minWidth: 0, overflow: 'hidden', marginBottom: 0, display: 'flex', flexDirection: 'column', position: 'relative', flex: '0 1 auto' }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{data.name}</div>
      <Section title="Stats">
        {data.stats && (
          <div style={{ display: 'flex', margin: '16px 0', background: 'linear-gradient(135deg, #222a4d 80%, #181f3a 100%)', borderRadius: 6, overflow: 'hidden', border: '1px solid #FFD600', color: '#FFD600', width: '100%' }}>
            <div style={{ flex: 1, padding: 8, borderRight: '2px solid #FFD600', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#FFD600', fontSize: 16 }}>Physical</div>
              <div>STR {data.stats.physical.strength}</div>
              <div>SPD {data.stats.physical.speed}</div>
              <div style={{ fontWeight: 700 }}>DEF {defense.physical}</div>
            </div>
            <div style={{ flex: 1, padding: 8, borderRight: '2px solid #FFD600', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#FFD600', fontSize: 16 }}>Cognitive</div>
              <div>INT {data.stats.cognitive.intelligence}</div>
              <div>WIL {data.stats.cognitive.willpower}</div>
              <div style={{ fontWeight: 700 }}>DEF {defense.cognitive}</div>
            </div>
            <div style={{ flex: 1, padding: 8, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#FFD600', fontSize: 16 }}>Spiritual</div>
              <div>AWA {data.stats.spiritual.awareness}</div>
              <div>PRE {data.stats.spiritual.presence}</div>
              <div style={{ fontWeight: 700 }}>DEF {defense.spiritual}</div>
            </div>
          </div>
        )}
        {/* Movement & Senses */}
        {data.movement !== undefined && (
          <div style={{ marginBottom: 8, color: '#FFD600' }}>
            <span style={{ fontWeight: 700 }}>Movement:</span> <span style={{ fontWeight: 400 }}>{data.movement} ft.</span>
            <span style={{ marginLeft: 16, fontWeight: 700 }}>Senses:</span>
            <span style={{ fontWeight: 400 }}>
              {data.senses ? Object.entries(data.senses)
                .filter(([_, v]) => v !== undefined && v !== null)
                .map(([sense, v]) => `${v} ft. (${sense})`).join(', ') : '—'}
            </span>
          </div>
        )}
        {/* Skills */}
        {data.skills && (
          <div style={{ marginBottom: 8, color: '#FFD600' }}>
            <span style={{ fontWeight: 700 }}>Physical Skills:</span> <span style={{ fontWeight: 400 }}>{data.skills.physical ? Object.entries(data.skills.physical).map(([k, v]) => `${k} +${v}`).join(', ') : '—'}</span>
            <br />
            <span style={{ fontWeight: 700 }}>Spiritual Skills:</span> <span style={{ fontWeight: 400 }}>{data.skills.spiritual ? Object.entries(data.skills.spiritual).map(([k, v]) => `${k} +${v}`).join(', ') : '—'}</span>
            <br />
            <span style={{ fontWeight: 700 }}>Cognitive Skills:</span> <span style={{ fontWeight: 400 }}>{data.skills.cognitive ? Object.entries(data.skills.cognitive).map(([k, v]) => `${k} +${v}`).join(', ') : '—'}</span>
          </div>
        )}
        {data.languages && (
          <div style={{ marginBottom: 8, color: '#FFD600' }}>
            <span style={{ fontWeight: 700 }}>Languages:</span> <span style={{ fontWeight: 400 }}>{data.languages}</span>
          </div>
        )}
      </Section>
      <Section title="Features">
        {data.features && typeof data.features === 'object' && !Array.isArray(data.features)
          ? Object.entries(data.features).map(([key, value], i) => (
              <div key={i} style={{ marginBottom: 4, color: '#FFD600' }}>
                <span style={{ fontWeight: 700 }}>{key}</span>: <span style={{ fontWeight: 400 }}>{String(value)}</span>
              </div>
            ))
          : Array.isArray(data.features)
            ? data.features.map((f, i) => (
                <div key={i} style={{ marginBottom: 4, color: '#FFD600' }}>
                  <span style={{ fontWeight: 700 }}>{f.name ? f.name : Object.keys(f)[0]}</span>: <span style={{ fontWeight: 400 }}>{f.description ? f.description : Object.values(f)[0]}</span>
                </div>
              ))
            : <div style={{ color: '#FFD600' }}>{JSON.stringify(data.features)}</div>
        }
      </Section>
      
      {/* Tactics Section */}
      <Section title="Tactics">
        {data.tactics
          ? <div style={{ color: '#FFD600' }}>{data.tactics}</div>
          : <div style={{ color: '#FFD600' }}>—</div>
        }
      </Section>

      <Section title="Actions">
        {data.actions && Object.entries(data.actions).map(([actionType, actions]) => {
          if (!Array.isArray(actions) || actions.length === 0) return null;
          let emoji = '';
          switch (actionType) {
            case 'action': emoji = '▶️'; break; // Play Icon
            case 'bi_action': emoji = '⏩'; break; // FastForward
            case 'tri_action': emoji = '▶️⏩'; break; // Play + FastForward
            case 'free': emoji = '⏺️'; break; // Empty play icon
            case 'reaction': emoji = '↩️'; break; // Reverse arrow
            default: emoji = '⚡';
          }
          return (
            <div className={`${stormBorders} ${glow}`}>
              <Section key={actionType} title={`${emoji} ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}>
                {actions.map((a, idx) => (
                  <div key={actionType + idx}>
                    <span style={{ fontWeight: 700 }}>{a.name}</span>. <span style={{ fontWeight: 400 }}>{a.description}</span>
                  </div>
                ))}
              </Section>
             </div>
          );
        })}
      </Section>
     
    </div>
  );
};

export default CombatantAttributes;
