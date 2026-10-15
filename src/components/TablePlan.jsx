import React, { useState, useEffect } from 'react';

export const DEFAULT_TABLE_CONFIGS = {
  // Finestre su Vindegade (In alto)
  '9':  { id: '9',  label: 'T9',  name: 'Tavolo 9',  pax: 2, zone: 'Finestre su Vindegade',          direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false } },
  '10': { id: '10', label: 'T10', name: 'Tavolo 10', pax: 2, zone: 'Finestre su Vindegade',          direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false }, pairWith: '11' },
  '11': { id: '11', label: 'T11', name: 'Tavolo 11', pax: 2, zone: 'Finestre su Vindegade',          direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false }, pairWith: '10' },
  '2':  { id: '2',  label: 'T2',  name: 'Tavolo 2',  pax: 2, zone: 'Finestre su Vindegade (Destra)', direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true } },

  // Parete Sinistra (T7 sopra, T8 sotto)
  '7':  { id: '7',  label: 'T7',  name: 'Tavolo 7',  pax: 2, zone: 'Parete Sinistra (Alto)',         direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true }, pairWith: '8' },
  '8':  { id: '8',  label: 'T8',  name: 'Tavolo 8',  pax: 2, zone: 'Parete Sinistra (Basso)',        direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true }, pairWith: '7' },

  // Centro Sala (T5 sopra, T6 sotto)
  '5':  { id: '5',  label: 'T5',  name: 'Tavolo 5',  pax: 2, zone: 'Centro Sala (Alto)',             direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true } },
  '6':  { id: '6',  label: 'T6',  name: 'Tavolo 6',  pax: 2, zone: 'Centro Sala (Basso)',            direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true } },

  // Parete Destra (T3 centro, T4 basso)
  '3':  { id: '3',  label: 'T3',  name: 'Tavolo 3',  pax: 2, zone: 'Parete Destra (Centro)',         direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false } },
  '4':  { id: '4',  label: 'T4',  name: 'Tavolo 4',  pax: 2, zone: 'Parete Destra (Basso)',          direction: 'horizontal', sides: { top: false, bottom: false, left: true, right: true } },

  // Saletta Privata
  '14': { id: '14', label: 'T14', name: 'Tavolo 14', pax: 2, zone: 'Saletta (Singolo)',             direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false } },
  '12': { id: '12', label: 'T12', name: 'Tavolo 12', pax: 2, zone: 'Saletta (Modulare)',            direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false }, pairWith: '13' },
  '13': { id: '13', label: 'T13', name: 'Tavolo 13', pax: 2, zone: 'Saletta (Modulare)',            direction: 'vertical',   sides: { top: true, bottom: true, left: false, right: false }, pairWith: '12' }
};

export const TABLES = Object.values(DEFAULT_TABLE_CONFIGS);

export const PRESET_COMBOS = [
  { id: 'combo-7-8', label: 'Tavoli T7 + T8 (Parete Sinistra - 4 pax)', tables: ['7', '8'], capacity: 4 },
  { id: 'combo-10-11', label: 'Tavoli T10 + T11 (Vindegade - 4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-5-6', label: 'Tavoli T5 + T6 (Centro Sala - 4 pax)', tables: ['5', '6'], capacity: 4 },
  { id: 'combo-3-4', label: 'Tavoli T3 + T4 (Parete Destra - 4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Parete Destra T2 + T3 + T4 (6 pax)', tables: ['2', '3', '4'], capacity: 6 },
  { id: 'combo-12-13', label: 'Saletta T12 + T13 (4 pax)', tables: ['12', '13'], capacity: 4 },
  { id: 'combo-12-13-14', label: 'Saletta Completa T12 + T13 + T14 (6 pax)', tables: ['12', '13', '14'], capacity: 6 }
];

export default function TablePlan({ 
  selectedTables = [], 
  onToggleTable, 
  guests, 
  occupiedTables = [],
  onConfigChange
}) {
  const [hoveredTable, setHoveredTable] = useState(null);
  const [activeEditingId, setActiveEditingId] = useState('5'); // Default table open in configurator

  // Load custom table configurations (chair counts & direction) from localStorage
  const [tableConfigs, setTableConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_table_configs_v2');
      if (saved) {
        return { ...DEFAULT_TABLE_CONFIGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading table configs', e);
    }
    return DEFAULT_TABLE_CONFIGS;
  });

  const saveConfigs = (newConfigs) => {
    setTableConfigs(newConfigs);
    try {
      localStorage.setItem('pupi_table_configs_v2', JSON.stringify(newConfigs));
    } catch (e) {
      console.warn('Error saving table configs', e);
    }
    if (onConfigChange) {
      onConfigChange(newConfigs);
    }
  };

  const updateTablePax = (id, delta) => {
    const current = tableConfigs[id] || DEFAULT_TABLE_CONFIGS[id];
    const newPax = Math.max(1, Math.min(8, (current.pax || 2) + delta));
    const updated = {
      ...tableConfigs,
      [id]: { ...current, pax: newPax }
    };
    saveConfigs(updated);
  };

  const setTablePaxDirect = (id, newPax) => {
    const current = tableConfigs[id] || DEFAULT_TABLE_CONFIGS[id];
    const updated = {
      ...tableConfigs,
      [id]: { ...current, pax: newPax }
    };
    saveConfigs(updated);
  };

  const setTableDirection = (id, dir) => {
    const current = tableConfigs[id] || DEFAULT_TABLE_CONFIGS[id];
    let sides = { top: false, bottom: false, left: false, right: false };
    if (dir === 'vertical') {
      sides = { top: true, bottom: true, left: false, right: false };
    } else if (dir === 'horizontal') {
      sides = { top: false, bottom: false, left: true, right: true };
    } else if (dir === 'all-around') {
      sides = { top: true, bottom: true, left: true, right: true };
    }
    const updated = {
      ...tableConfigs,
      [id]: { ...current, direction: dir, sides }
    };
    saveConfigs(updated);
  };

  const toggleTableSide = (id, side) => {
    const current = tableConfigs[id] || DEFAULT_TABLE_CONFIGS[id];
    const currentSides = current.sides || { top: true, bottom: true, left: false, right: false };
    const newSides = { ...currentSides, [side]: !currentSides[side] };
    const updated = {
      ...tableConfigs,
      [id]: { ...current, direction: 'custom', sides: newSides }
    };
    saveConfigs(updated);
  };

  const resetAllConfigs = () => {
    saveConfigs(DEFAULT_TABLE_CONFIGS);
  };

  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  // Exact 2x pixel coordinates of the 13 tables on the single unified architectural plan
  const TABLE_COORDS = {
    // Top Row - Finestre su Vindegade
    '9':  { x: 54,  y: 106, w: 60, h: 60 },
    '10': { x: 204, y: 106, w: 60, h: 60 },
    '11': { x: 284, y: 106, w: 60, h: 60 },
    '2':  { x: 626, y: 108, w: 60, h: 60 },

    // Middle Row - Parete Sinistra (T7), Centro (T5), Parete Destra (T3)
    '7':  { x: 74,  y: 272, w: 60, h: 60 },
    '5':  { x: 466, y: 250, w: 60, h: 60 },
    '3':  { x: 648, y: 240, w: 60, h: 60 },

    // Bottom Row - Parete Sinistra (T8), Centro (T6), Parete Destra (T4)
    '8':  { x: 74,  y: 362, w: 60, h: 60 },
    '6':  { x: 466, y: 386, w: 60, h: 60 },
    '4':  { x: 638, y: 394, w: 60, h: 60 },

    // Saletta Privata (Sotto - continua nella stessa planimetria)
    '14': { x: 204, y: 535, w: 60, h: 60 },
    '12': { x: 204, y: 645, w: 60, h: 60 },
    '13': { x: 284, y: 645, w: 60, h: 60 }
  };

  const allTableList = Object.keys(DEFAULT_TABLE_CONFIGS).map(id => {
    return {
      ...(DEFAULT_TABLE_CONFIGS[id]),
      ...(tableConfigs[id] || {})
    };
  });

  const totalSeats = allTableList.reduce((acc, t) => acc + (t.pax || 2), 0);
  const selectedPax = selectedTables.reduce((acc, tid) => {
    const t = tableConfigs[tid] || DEFAULT_TABLE_CONFIGS[tid];
    return acc + (t ? t.pax : 2);
  }, 0);

  // Compute exact chair coordinates for a table based on its pax count and active sides
  const getChairsForTable = (t, coords) => {
    const { x, y, w, h } = coords;
    const pax = t.pax || 2;
    const direction = t.direction || 'vertical';
    const sides = t.sides || (direction === 'vertical' ? { top: true, bottom: true } : { left: true, right: true });
    
    const activeSides = [];
    if (sides.top) activeSides.push('top');
    if (sides.bottom) activeSides.push('bottom');
    if (sides.left) activeSides.push('left');
    if (sides.right) activeSides.push('right');

    if (activeSides.length === 0) {
      activeSides.push(direction === 'horizontal' ? 'left' : 'top');
    }

    const chairs = [];
    const countPerSide = {};
    activeSides.forEach(s => { countPerSide[s] = 0; });

    // Distribute pax across active sides
    for (let i = 0; i < pax; i++) {
      const side = activeSides[i % activeSides.length];
      countPerSide[side] = (countPerSide[side] || 0) + 1;
    }

    const offset = 9; // distance from table edge

    // Helper to generate coordinates along an edge
    const placeChairsOnEdge = (side, count) => {
      for (let i = 0; i < count; i++) {
        const fraction = (i + 1) / (count + 1);
        if (side === 'top') {
          chairs.push({ cx: x + w * fraction, cy: y - offset });
        } else if (side === 'bottom') {
          chairs.push({ cx: x + w * fraction, cy: y + h + offset });
        } else if (side === 'left') {
          chairs.push({ cx: x - offset, cy: y + h * fraction });
        } else if (side === 'right') {
          chairs.push({ cx: x + w + offset, cy: y + h * fraction });
        }
      }
    };

    activeSides.forEach(s => {
      placeChairsOnEdge(s, countPerSide[s] || 0);
    });

    return chairs;
  };

  const currentEditing = tableConfigs[activeEditingId] || DEFAULT_TABLE_CONFIGS[activeEditingId];

  const renderTable = (t) => {
    const coords = TABLE_COORDS[t.id];
    if (!coords) return null;
    const { x, y, w, h } = coords;

    const selected = isSelected(t.id);
    const occupied = isOccupied(t.id);
    const hovered = hoveredTable?.id === t.id;
    const isEditing = activeEditingId === t.id;

    let fill = '#FFFFFF';
    let stroke = '#D1D5DB';
    let textColor = '#333333';
    let subColor = '#666666';
    let chairFill = '#B5A642';

    if (occupied) {
      fill = '#F3F4F6';
      stroke = '#E5E7EB';
      textColor = '#9CA3AF';
      subColor = '#D1D5DB';
      chairFill = '#D1D5DB';
    } else if (selected) {
      fill = '#FDB4BF';
      stroke = '#333333';
      textColor = '#333333';
      subColor = '#333333';
      chairFill = '#333333';
    } else if (isEditing) {
      fill = '#FFF5F6';
      stroke = '#B5A642';
      textColor = '#333333';
      chairFill = '#B5A642';
    } else if (hovered) {
      fill = '#FFF5F6';
      stroke = '#B5A642';
    }

    const chairs = getChairsForTable(t, coords);

    return (
      <g
        key={t.id}
        onClick={() => {
          setActiveEditingId(t.id);
          if (!occupied && onToggleTable) {
            onToggleTable(t.id);
          }
        }}
        onMouseEnter={() => setHoveredTable(t)}
        onMouseLeave={() => setHoveredTable(null)}
        style={{ cursor: occupied ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
      >
        {/* Chairs (rendered based on custom orientation & pax count) */}
        {chairs.map((c, i) => (
          <circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r="4.5"
            fill={chairFill}
            style={{ transition: 'all 0.15s ease' }}
          />
        ))}

        {/* Table Box - Squadrato (border-radius 0px) */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="0"
          fill={fill}
          stroke={stroke}
          strokeWidth={selected || isEditing ? 2 : 1.2}
          filter="url(#archShadow)"
          style={{ transition: 'all 0.15s ease' }}
        />

        {/* Selected or Active Indicator Ring */}
        {isEditing && !selected && (
          <rect
            x={x - 2}
            y={y - 2}
            width={w + 4}
            height={h + 4}
            fill="none"
            stroke="#B5A642"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {/* Table Label */}
        <text
          x={x + w / 2}
          y={y + h / 2 - 2}
          fill={textColor}
          fontSize="15"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {t.label}
        </text>

        {/* Pax Indicator */}
        <text
          x={x + w / 2}
          y={y + h / 2 + 15}
          fill={subColor}
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {t.pax || 2} pax
        </text>
      </g>
    );
  };

  return (
    <div style={{ 
      background: '#FFFFFF', 
      border: '1px solid #D1D5DB', 
      borderRadius: '0px', 
      padding: '24px', 
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      position: 'relative' 
    }}>
      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '16px' 
      }}>
        <div>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: '#B5A642', 
            marginBottom: '4px' 
          }}>
            Planimetria Unica del Ristorante
          </div>
          <h3 style={{ 
            fontSize: '22px', 
            fontWeight: 700, 
            color: '#333333', 
            margin: '0 0 4px 0', 
            fontFamily: 'DALI, serif' 
          }}>
            I Pupi Siciliani · Odense
          </h3>
          <p style={{ fontSize: '13px', color: '#666666', margin: 0 }}>
            Tutte le 13 postazioni in planimetria continua con sedute orientabili
          </p>
        </div>

        {/* Legend & Live Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: '#4B5563', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#FFFFFF', border: '1.2px solid #D1D5DB', borderRadius: '0px' }}></span> Libero
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#FDB4BF', border: '1.5px solid #333333', borderRadius: '0px' }}></span> Selezionato
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '0px' }}></span> Occupato
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#666666' }}>
              <span style={{ width: '7px', height: '7px', background: '#B5A642', borderRadius: '50%' }}></span> Seduta
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#333333', fontWeight: 600 }}>
            Tavoli scelti: <strong style={{ color: '#B5A642' }}>{selectedTables.map(t => 'T' + t).join(', ') || 'Nessuno'}</strong> ({selectedPax} / {totalSeats} pax totali)
          </div>
        </div>
      </div>

      {/* Interactive Chair & Pax Configurator Panel (Design System Squadrato) */}
      <div style={{
        background: '#FFF5F6',
        border: '1px solid #FDB4BF',
        borderRadius: '0px',
        padding: '16px 18px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#333333', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚙︎ Configura Tavolo & Sedie:
            </span>
            {/* Quick table selector buttons */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {allTableList.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveEditingId(t.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: activeEditingId === t.id ? '#333333' : '#FFFFFF',
                    color: activeEditingId === t.id ? '#FFFFFF' : '#333333',
                    border: '1px solid ' + (activeEditingId === t.id ? '#333333' : '#D1D5DB'),
                    borderRadius: '0px',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={resetAllConfigs}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8C7E26',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Ripristina sedie default
          </button>
        </div>

        {/* Controls for current active table */}
        {currentEditing && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '16px', 
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: '1px dashed #FDB4BF'
          }}>
            {/* 1. Pax Count Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#444444' }}>
                Coperti (Sedie {currentEditing.label}):
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #D1D5DB', background: '#FFFFFF' }}>
                <button
                  type="button"
                  onClick={() => updateTablePax(currentEditing.id, -1)}
                  style={{ width: '28px', height: '28px', border: 'none', background: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                  title="Rimuovi sedia"
                >
                  -
                </button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '14px', color: '#333333' }}>
                  {currentEditing.pax || 2}
                </span>
                <button
                  type="button"
                  onClick={() => updateTablePax(currentEditing.id, 1)}
                  style={{ width: '28px', height: '28px', border: 'none', background: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                  title="Aggiungi sedia"
                >
                  +
                </button>
              </div>

              {/* Direct numbers */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTablePaxDirect(currentEditing.id, num)}
                    style={{
                      width: '26px',
                      height: '26px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: (currentEditing.pax === num) ? '#B5A642' : '#FFFFFF',
                      color: (currentEditing.pax === num) ? '#FFFFFF' : '#333333',
                      border: '1px solid ' + (currentEditing.pax === num ? '#B5A642' : '#D1D5DB'),
                      borderRadius: '0px',
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Chair Direction Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#444444' }}>
                Direzione sedie:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setTableDirection(currentEditing.id, 'vertical')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '0px',
                    cursor: 'pointer',
                    background: currentEditing.direction === 'vertical' ? '#333333' : '#FFFFFF',
                    color: currentEditing.direction === 'vertical' ? '#FFFFFF' : '#333333',
                    border: '1px solid ' + (currentEditing.direction === 'vertical' ? '#333333' : '#D1D5DB')
                  }}
                  title="Sedie sopra e sotto"
                >
                  ↕ Verticale
                </button>
                <button
                  type="button"
                  onClick={() => setTableDirection(currentEditing.id, 'horizontal')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '0px',
                    cursor: 'pointer',
                    background: currentEditing.direction === 'horizontal' ? '#333333' : '#FFFFFF',
                    color: currentEditing.direction === 'horizontal' ? '#FFFFFF' : '#333333',
                    border: '1px solid ' + (currentEditing.direction === 'horizontal' ? '#333333' : '#D1D5DB')
                  }}
                  title="Sedie a destra e sinistra"
                >
                  ↔ Orizzontale
                </button>
                <button
                  type="button"
                  onClick={() => setTableDirection(currentEditing.id, 'all-around')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '0px',
                    cursor: 'pointer',
                    background: currentEditing.direction === 'all-around' ? '#333333' : '#FFFFFF',
                    color: currentEditing.direction === 'all-around' ? '#FFFFFF' : '#333333',
                    border: '1px solid ' + (currentEditing.direction === 'all-around' ? '#333333' : '#D1D5DB')
                  }}
                  title="Sedie su tutti i 4 lati"
                >
                  ✚ 4 Lati
                </button>
              </div>
            </div>

            {/* 3. Individual side toggles (Top, Bottom, Left, Right) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#666666' }}>Lati:</span>
              {[
                { side: 'top', label: 'Alto' },
                { side: 'bottom', label: 'Basso' },
                { side: 'left', label: 'Sinistra' },
                { side: 'right', label: 'Destra' }
              ].map(({ side, label }) => {
                const isActive = currentEditing.sides && currentEditing.sides[side];
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => toggleTableSide(currentEditing.id, side)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '0px',
                      cursor: 'pointer',
                      background: isActive ? '#FFF5F6' : '#FFFFFF',
                      color: isActive ? '#B5A642' : '#888888',
                      border: '1.5px solid ' + (isActive ? '#B5A642' : '#D1D5DB')
                    }}
                  >
                    {isActive ? '✓ ' : ''}{label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas - Single Continuous Architectural Floor Plan (All 13 Tables) */}
      <svg 
        viewBox="20 20 740 730" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          display: 'block', 
          background: '#FFFFFF', 
          borderRadius: '0px', 
          border: '1px solid #D1D5DB' 
        }}
      >
        <defs>
          <filter id="archShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.05" />
          </filter>
        </defs>

        {/* 1. Main Hall Outer Boundary (x: 48..728, y: 46..482) */}
        <rect x="48" y="46" width="680" height="436" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />

        {/* Top Windows Section (FINESTRE SU VINDEGADE) */}
        <line x1="54" y1="57" x2="200" y2="57" stroke="#B5A642" strokeWidth="3.5" />
        <line x1="208" y1="57" x2="564" y2="57" stroke="#B5A642" strokeWidth="3.5" strokeDasharray="8 6" />
        <line x1="572" y1="57" x2="708" y2="57" stroke="#B5A642" strokeWidth="3.5" />
        
        <text 
          x="386" 
          y="76" 
          fill="#B5A642" 
          fontSize="11" 
          fontWeight="700" 
          textAnchor="middle" 
          letterSpacing="0.08em"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          FINESTRE SU VINDEGADE
        </text>

        {/* Entrata opening indicator */}
        <polygon points="350,56 345,48 355,48" fill="#B5A642" />

        {/* Right wall arrow indicator */}
        <g transform="translate(738, 312)">
          <line x1="0" y1="4" x2="0" y2="-4" stroke="#B5A642" strokeWidth="1.8" />
          <polyline points="-3,-1 0,-4 3,-1" fill="none" stroke="#B5A642" strokeWidth="1.8" />
        </g>

        {/* Modular Pair Indicator Lines (7-8, 10-11) */}
        <rect x="70" y="268" width="68" height="158" fill="none" stroke="#B5A642" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
        <rect x="200" y="102" width="148" height="68" fill="none" stroke="#B5A642" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />

        {/* 2. Saletta Alcove Boundary (x: 184..380, y: 482..730) - Open to Main Hall */}
        <rect x="184" y="482" width="196" height="248" fill="#FFF5F6" stroke="#D1D5DB" strokeWidth="1.5" />
        {/* Remove boundary line between Main Hall and Saletta to show open passage */}
        <line x1="184" y1="482" x2="380" y2="482" stroke="#FFF5F6" strokeWidth="3" />

        <text 
          x="282" 
          y="508" 
          fill="#8C7E26" 
          fontSize="11" 
          fontWeight="700" 
          textAnchor="middle" 
          letterSpacing="0.08em"
        >
          SALETTA PRIVATA
        </text>

        {/* Saletta Modular Pair Indicator Line (12-13) */}
        <rect x="200" y="641" width="148" height="68" fill="none" stroke="#B5A642" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />

        {/* 3. Bottom-Left Exterior Cutout (x: 48..184, y: 482..730) */}
        <rect x="48" y="482" width="136" height="248" fill="#FAF8F5" stroke="#E5E7EB" strokeWidth="1" />
        <text x="116" y="605" fill="#9CA3AF" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.04em">
          Ingresso
        </text>

        {/* 4. Bottom-Right Kitchen & Restrooms Corridor (x: 380..728, y: 482..730) */}
        <rect x="380" y="482" width="348" height="248" fill="#FAF8F5" stroke="#D1D5DB" strokeWidth="1.5" />
        
        {/* Door swing arc for corridor entrance */}
        <path d="M 380 540 A 50 50 0 0 1 430 590" fill="none" stroke="#B5A642" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="380" y1="540" x2="430" y2="540" stroke="#333333" strokeWidth="1.5" />

        <text x="554" y="590" fill="#666666" fontSize="13" fontWeight="700" textAnchor="middle">
          corridoio bagno
        </text>
        <text x="554" y="612" fill="#666666" fontSize="13" fontWeight="700" textAnchor="middle">
          + cucina
        </text>
        <text x="554" y="635" fill="#9CA3AF" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="0.06em">
          ZONA RISERVATA
        </text>

        {/* Render All 13 Tables with live custom chairs & pax */}
        {allTableList.map(t => renderTable(t))}
      </svg>

      {/* Footer Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid #EEEEEE', 
        fontSize: '12px', 
        color: '#666666' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#B5A642', fontWeight: 700 }}>✦</span>
          <span style={{ fontWeight: 600, color: '#333333' }}>
            Planimetria unica senza cambi vista: clicca su un tavolo per orientare le sedute o cambiare la capienza
          </span>
        </div>
        <div>
          Vindegade 73 · Odense C
        </div>
      </div>
    </div>
  );
}
