import React, { useState } from 'react';

export const TABLES = [
  // Finestre su Vindegade (In alto)
  { id: '9', label: 'T9', name: 'Tavolo 9', pax: 2, zone: 'Finestre su Vindegade', chairs: 'vertical' },
  { id: '10', label: 'T10', name: 'Tavolo 10', pax: 2, zone: 'Finestre su Vindegade', chairs: 'vertical', pairWith: '11' },
  { id: '11', label: 'T11', name: 'Tavolo 11', pax: 2, zone: 'Finestre su Vindegade', chairs: 'vertical', pairWith: '10' },
  { id: '2', label: 'T2', name: 'Tavolo 2', pax: 2, zone: 'Finestre su Vindegade (Destra)', chairs: 'horizontal' },

  // Parete Sinistra (T7 sopra, T8 sotto)
  { id: '7', label: 'T7', name: 'Tavolo 7', pax: 2, zone: 'Parete Sinistra (Alto)', chairs: 'horizontal', pairWith: '8' },
  { id: '8', label: 'T8', name: 'Tavolo 8', pax: 2, zone: 'Parete Sinistra (Basso)', chairs: 'horizontal', pairWith: '7' },

  // Centro Sala (T5 sopra, T6 sotto)
  { id: '5', label: 'T5', name: 'Tavolo 5', pax: 2, zone: 'Centro Sala (Alto)', chairs: 'horizontal' },
  { id: '6', label: 'T6', name: 'Tavolo 6', pax: 2, zone: 'Centro Sala (Basso)', chairs: 'horizontal' },

  // Parete Destra (T3 centro, T4 basso)
  { id: '3', label: 'T3', name: 'Tavolo 3', pax: 2, zone: 'Parete Destra (Centro)', chairs: 'vertical' },
  { id: '4', label: 'T4', name: 'Tavolo 4', pax: 2, zone: 'Parete Destra (Basso)', chairs: 'horizontal' },

  // Saletta Privata
  { id: '14', label: 'T14', name: 'Tavolo 14', pax: 2, zone: 'Saletta (Singolo)', chairs: 'vertical' },
  { id: '12', label: 'T12', name: 'Tavolo 12', pax: 2, zone: 'Saletta (Modulare)', chairs: 'vertical', pairWith: '13' },
  { id: '13', label: 'T13', name: 'Tavolo 13', pax: 2, zone: 'Saletta (Modulare)', chairs: 'vertical', pairWith: '12' }
];

export const PRESET_COMBOS = [
  { id: 'combo-7-8', label: 'Tavoli T7 + T8 (Parete Sinistra - 4 pax)', tables: ['7', '8'], capacity: 4 },
  { id: 'combo-10-11', label: 'Tavoli T10 + T11 (Vindegade - 4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-5-6', label: 'Tavoli T5 + T6 (Centro Sala - 4 pax)', tables: ['5', '6'], capacity: 4 },
  { id: 'combo-3-4', label: 'Tavoli T3 + T4 (Parete Destra - 4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Parete Destra T2 + T3 + T4 (6 pax)', tables: ['2', '3', '4'], capacity: 6 },
  { id: 'combo-12-13', label: 'Saletta T12 + T13 (4 pax)', tables: ['12', '13'], capacity: 4 },
  { id: 'combo-12-13-14', label: 'Saletta Completa T12 + T13 + T14 (6 pax)', tables: ['12', '13', '14'], capacity: 6 }
];

export default function TablePlan({ selectedTables = [], onToggleTable, guests, occupiedTables = [] }) {
  const [hoveredTable, setHoveredTable] = useState(null);
  const [viewZone, setViewZone] = useState('all'); // 'all' | 'main' | 'saletta'

  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  const totalSeats = TABLES.length * 2;
  const selectedPax = selectedTables.reduce((acc, tid) => {
    const t = TABLES.find(item => item.id === tid);
    return acc + (t ? t.pax : 2);
  }, 0);

  // Exact positions mapped from the user's architectural diagram (media_1792059008109_e7aa0d10.png)
  const TABLE_COORDS = {
    // Top Row - Finestre su Vindegade
    '9':  { x: 65,  y: 110, w: 72, h: 66 },
    '10': { x: 235, y: 110, w: 70, h: 66 },
    '11': { x: 325, y: 110, w: 70, h: 66 },
    '2':  { x: 745, y: 110, w: 72, h: 66 },

    // Middle Row - Parete Sinistra, Centro, Parete Destra
    '7':  { x: 85,  y: 285, w: 72, h: 66 },
    '5':  { x: 545, y: 265, w: 72, h: 66 },
    '3':  { x: 765, y: 255, w: 72, h: 66 },

    // Bottom Row - Parete Sinistra, Centro, Parete Destra
    '8':  { x: 85,  y: 405, w: 72, h: 66 },
    '6':  { x: 545, y: 420, w: 72, h: 66 },
    '4':  { x: 755, y: 430, w: 72, h: 66 },

    // Saletta Privata (Sotto Centro-Sinistra)
    '14': { x: 235, y: 580, w: 72, h: 66 },
    '12': { x: 235, y: 690, w: 70, h: 66 },
    '13': { x: 315, y: 690, w: 70, h: 66 }
  };

  const currentTables = TABLES.filter(t => {
    if (viewZone === 'main') return !['14', '12', '13'].includes(t.id);
    if (viewZone === 'saletta') return ['14', '12', '13'].includes(t.id);
    return true;
  });

  const renderTable = (t) => {
    const coords = TABLE_COORDS[t.id];
    if (!coords) return null;
    const { x, y, w, h } = coords;

    const selected = isSelected(t.id);
    const occupied = isOccupied(t.id);
    const hovered = hoveredTable?.id === t.id;

    let fill = '#FFFFFF';
    let stroke = '#D1D5DB';
    let textColor = '#111827';
    let subColor = '#6B7280';
    let chairFill = '#B0B8B3';

    if (occupied) {
      fill = '#F3F4F6';
      stroke = '#E5E7EB';
      textColor = '#9CA3AF';
      subColor = '#D1D5DB';
      chairFill = '#D1D5DB';
    } else if (selected) {
      fill = '#FDB4BF';
      stroke = '#1E1E1E';
      textColor = '#1E1E1E';
      subColor = '#1E1E1E';
      chairFill = '#1E1E1E';
    } else if (hovered) {
      fill = '#F9FAF9';
      stroke = '#B5A642';
      chairFill = '#B5A642';
    }

    // Chair positions (2 dots per table)
    let chairs = [];
    if (t.chairs === 'vertical') {
      // Chairs top and bottom
      chairs = [
        { cx: x + w / 2, cy: y - 10 },
        { cx: x + w / 2, cy: y + h + 10 }
      ];
    } else {
      // Chairs left and right
      chairs = [
        { cx: x - 10, cy: y + h / 2 },
        { cx: x + w + 10, cy: y + h / 2 }
      ];
    }

    return (
      <g
        key={t.id}
        onClick={() => !occupied && onToggleTable && onToggleTable(t.id)}
        onMouseEnter={() => setHoveredTable(t)}
        onMouseLeave={() => setHoveredTable(null)}
        style={{ cursor: occupied ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
      >
        {/* Chairs (dots) */}
        {chairs.map((c, i) => (
          <circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r="4.5"
            fill={chairFill}
            style={{ transition: 'fill 0.15s ease' }}
          />
        ))}

        {/* Table Box */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="6"
          fill={fill}
          stroke={stroke}
          strokeWidth={selected ? 2 : 1.2}
          filter="url(#archShadow)"
          style={{ transition: 'all 0.15s ease' }}
        />

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
          fontWeight="500"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {t.pax} pax
        </text>
      </g>
    );
  };

  return (
    <div style={{ 
      background: '#FFFFFF', 
      border: '1px solid #E5E7EB', 
      borderRadius: '8px', 
      padding: '24px', 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
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
            Planimetria del Ristorante
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#111827', 
            margin: '0 0 4px 0', 
            fontFamily: 'serif' 
          }}>
            I Pupi Siciliani · Odense
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Layout esatto dei tavoli con orientamento sedute e capienza
          </p>
        </div>

        {/* View Zone Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: '#F9FAFB', padding: '4px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
          <button
            type="button"
            onClick={() => setViewZone('all')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: viewZone === 'all' ? '#111827' : 'transparent',
              color: viewZone === 'all' ? '#FFFFFF' : '#4B5563',
              transition: 'all 0.15s ease'
            }}
          >
            Tutte le Sale (13)
          </button>
          <button
            type="button"
            onClick={() => setViewZone('main')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: viewZone === 'main' ? '#111827' : 'transparent',
              color: viewZone === 'main' ? '#FFFFFF' : '#4B5563',
              transition: 'all 0.15s ease'
            }}
          >
            Sala Principale (10)
          </button>
          <button
            type="button"
            onClick={() => setViewZone('saletta')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: viewZone === 'saletta' ? '#111827' : 'transparent',
              color: viewZone === 'saletta' ? '#FFFFFF' : '#4B5563',
              transition: 'all 0.15s ease'
            }}
          >
            Saletta (3)
          </button>
        </div>
      </div>

      {/* Legend & Live Metrics */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        padding: '10px 14px',
        background: '#FAF8F5',
        borderRadius: '6px',
        border: '1px solid #ECE7DF',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', color: '#4B5563' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#FFFFFF', border: '1.2px solid #D1D5DB', borderRadius: '3px' }}></span> Libero
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#FDB4BF', border: '1.5px solid #1E1E1E', borderRadius: '3px' }}></span> Selezionato
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '3px' }}></span> Occupato
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6B7280' }}>
            <span style={{ width: '6px', height: '6px', background: '#B0B8B3', borderRadius: '50%' }}></span> = Seduta / Chair
          </span>
        </div>

        <div style={{ fontSize: '13px', color: '#111827', fontWeight: 600 }}>
          Tavoli scelti: <strong style={{ color: '#B5A642' }}>{selectedTables.map(t => 'T' + t).join(', ') || 'Nessuno'}</strong> ({selectedPax} / {totalSeats} pax)
        </div>
      </div>

      {/* SVG Canvas - Responsive Architectural Plan */}
      <svg 
        viewBox={viewZone === 'main' ? "0 0 900 530" : viewZone === 'saletta' ? "180 520 250 280" : "0 0 900 790"} 
        style={{ 
          width: '100%', 
          height: 'auto', 
          display: 'block', 
          background: '#FFFFFF', 
          borderRadius: '6px', 
          border: '1px solid #E5E7EB' 
        }}
      >
        <defs>
          <filter id="archShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Outer Hall Boundary */}
        {viewZone !== 'saletta' && (
          <g>
            <rect x="40" y="45" width="820" height="475" fill="#FAFAFA" stroke="#D1D5DB" strokeWidth="1.2" rx="4" />

            {/* Top Windows Section (FINESTRE SU VINDEGADE) */}
            <line x1="50" y1="58" x2="220" y2="58" stroke="#B5A642" strokeWidth="3" />
            <line x1="220" y1="58" x2="680" y2="58" stroke="#B5A642" strokeWidth="3" strokeDasharray="6 4" />
            <line x1="680" y1="58" x2="850" y2="58" stroke="#B5A642" strokeWidth="3" />
            
            <text 
              x="450" 
              y="76" 
              fill="#A39234" 
              fontSize="12" 
              fontWeight="700" 
              textAnchor="middle" 
              letterSpacing="0.14em"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              FINESTRE SU VINDEGADE
            </text>

            {/* Right wall arrow / passage indicator */}
            <g transform="translate(865, 290)">
              <line x1="0" y1="0" x2="8" y2="0" stroke="#B5A642" strokeWidth="2" />
              <polyline points="5,-3 8,0 5,3" fill="none" stroke="#B5A642" strokeWidth="2" />
            </g>

            {/* Connecting pair indicator for T10 & T11 */}
            <rect x="230" y="105" width="170" height="76" fill="none" stroke="#B5A642" strokeWidth="1" strokeDasharray="3 3" rx="4" opacity="0.6" />

            {/* Connecting pair indicator for T7 & T8 */}
            <rect x="80" y="280" width="82" height="196" fill="none" stroke="#B5A642" strokeWidth="1" strokeDasharray="3 3" rx="4" opacity="0.6" />
          </g>
        )}

        {/* Saletta Extension (shown in 'all' or 'saletta' mode) */}
        {viewZone !== 'main' && (
          <g>
            {/* Saletta Room Box */}
            <rect x="200" y="530" width="220" height="250" fill="#FAF8F5" stroke="#D1D5DB" strokeWidth="1.2" rx="4" />
            
            {/* Cutout area on the left of Saletta */}
            <rect x="40" y="530" width="160" height="250" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
            <text x="120" y="660" fill="#9CA3AF" fontSize="13" fontWeight="600" textAnchor="middle">
              Ingresso
            </text>

            {/* Cucina / Servizi area on the right of Saletta */}
            <rect x="420" y="530" width="440" height="250" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
            <text x="640" y="650" fill="#9CA3AF" fontSize="14" fontWeight="600" textAnchor="middle">
              Cucina & Servizi
            </text>
            <text x="640" y="675" fill="#9CA3AF" fontSize="12" textAnchor="middle">
              Corridoio Bagni
            </text>

            {/* Saletta Title Header */}
            <text 
              x="310" 
              y="555" 
              fill="#8F822E" 
              fontSize="12" 
              fontWeight="700" 
              textAnchor="middle" 
              letterSpacing="0.1em"
            >
              SALETTA PRIVATA
            </text>

            {/* Connecting pair indicator for T12 & T13 */}
            <rect x="230" y="685" width="160" height="76" fill="none" stroke="#B5A642" strokeWidth="1" strokeDasharray="3 3" rx="4" opacity="0.6" />
          </g>
        )}

        {/* Render Tables */}
        {currentTables.map(t => renderTable(t))}
      </svg>

      {/* Footer Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid #F3F4F6', 
        fontSize: '12px', 
        color: '#6B7280' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style={{ fontWeight: 600, color: '#374151' }}>Disposizione esatta sala e sedute</span>
        </div>
        <div>
          Odense · Vindegade
        </div>
      </div>
    </div>
  );
}
