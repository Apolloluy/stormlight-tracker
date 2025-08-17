// Reusable CombatantCard component
const CombatantCard = ({ combatant, counters, onCounterChange, onToggleActive, inactive }) => {
  let iconSrc = combatant.icon || '';
  if (iconSrc && !iconSrc.startsWith('http') && !iconSrc.startsWith('/')) {
    iconSrc = `/src/icons/${iconSrc}`;
  }
  return (
    <div key={combatant.id} style={{ border: '2px solid #1976d2', borderRadius: 12, background: 'linear-gradient(135deg, #181f3a 80%, #222a4d 100%)', boxShadow: '0 2px 16px #1976d2, 0 0 8px #222', padding: 20, color: '#fff', maxWidth: 420, minWidth: 0, overflow: 'hidden', marginBottom: 0, display: 'flex', flexDirection: 'column', position: 'relative', flex: '0 1 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        {iconSrc && (
          <img src={iconSrc} alt={combatant.name} style={{ width: 48, height: 48, border: '3px solid #FFD600', borderRadius: '50%', marginRight: 16, background: '#181f3a', boxShadow: '0 0 8px #FFD600' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 24, color: '#43ea7a', letterSpacing: 1 }}>{combatant.name}</div>
        </div>
        <button style={{ marginLeft: 12, background: '#222a4d', color: '#FFD600', border: '1px solid #FFD600', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 700 }} onClick={onToggleActive}>{inactive ? 'Activate' : 'Deactivate'}</button>
      </div>
      {/* Counter Controls on separate line */}
      {!inactive && (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 24, marginTop: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <CounterControl label="Health" value={counters?.health ?? 0} onChange={v => onCounterChange('health', v)} quickButtons={[{ label: '+5', delta: 5 }, { label: '+1', delta: 1 }, { label: '-1', delta: -1 }, { label: '-5', delta: -5 }]} highlight color="#43ea7a" />
          <CounterControl label="Focus" value={counters?.focus ?? 0} onChange={v => onCounterChange('focus', v)} quickButtons={[{ label: '+1', delta: 1 }, { label: '-1', delta: -1 }]} highlight color="#43ea7a" />
          <CounterControl label="Investiture" value={counters?.investiture ?? 0} onChange={v => onCounterChange('investiture', v)} quickButtons={[{ label: '+1', delta: 1 }, { label: '-1', delta: -1 }]} highlight color="#43ea7a" />
        </div>
      )}
    </div>
  )
};

const CounterControl = ({ label, value, onChange, quickButtons, highlight, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', width: '100%' }}>
    <span style={{ fontWeight: 700 }}>{label}:</span>
    {quickButtons && quickButtons.map(btn => (
      <button
        key={btn.label}
        onClick={() => onChange(value + btn.delta)}
        style={{
          background: btn.delta > 0 ? '#1976d2' : '#d32f2f',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          padding: '2px 8px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >{btn.label}</button>
    ))}
    <span style={{ position: 'absolute', right: 0, fontWeight: 700, background: highlight ? (color || '#FFD600') : 'none', color: highlight ? '#181f3a' : '#fff', borderRadius: 4, padding: highlight ? '2px 8px' : '0' }}>{value}</span>
  </div>
);


export default CombatantCard;