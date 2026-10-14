import React, { useState } from 'react';

export const TABLES = [
  // Parete Sinistra / Vetrate
  { id: '9', name: 'Tavolo 9', pax: 2, x: 64, y: 135, w: 42, h: 42, zone: 'Vetrate Sinistra' },
  { id: '10', name: 'Tavolo 10', pax: 2, x: 142, y: 135, w: 40, h: 42, zone: 'Ingresso / Finestra', pairWith: '11' },
  { id: '11', name: 'Tavolo 11', pax: 2, x: 184, y: 135, w: 40, h: 42, zone: 'Ingresso / Finestra', pairWith: '10' },

  // Parete sinistra verticale (8 sopra, 7 sotto)
  { id: '8', name: 'Tavolo 8', pax: 2, x: 108, y: 240, w: 42, h: 42, zone: 'Parete Sinistra (Alto)', pairWith: '7' },
  { id: '7', name: 'Tavolo 7', pax: 2, x: 108, y: 294, w: 42, h: 42, zone: 'Parete Sinistra (Basso)', pairWith: '8' },

  // Centro e Cucina
  { id: '5', name: 'Tavolo 5', pax: 2, x: 725, y: 220, w: 42, h: 42, zone: 'Centro Sala' },
  { id: '6', name: 'Tavolo 6', pax: 2, x: 520, y: 330, w: 42, h: 42, zone: 'Bordo Cucina' },

  // Parete Destra (dall'alto al basso: 2, 3, 4)
  { id: '2', name: 'Tavolo 2', pax: 2, x: 900, y: 140, w: 42, h: 42, zone: 'Parete Destra (Alto)' },
  { id: '3', name: 'Tavolo 3', pax: 2, x: 900, y: 225, w: 42, h: 42, zone: 'Parete Destra (Centro)' },
  { id: '4', name: 'Tavolo 4', pax: 2, x: 900, y: 310, w: 42, h: 42, zone: 'Parete Destra (Basso)' },

  // Saletta
  { id: '14', name: 'Tavolo 14', pax: 2, x: 236, y: 395, w: 42, h: 42, zone: 'Saletta (Singolo)' },
  { id: '12', name: 'Tavolo 12', pax: 2, x: 236, y: 505, w: 40, h: 42, zone: 'Saletta (Modulare)', pairWith: '13' },
  { id: '13', name: 'Tavolo 13', pax: 2, x: 278, y: 505, w: 40, h: 42, zone: 'Saletta (Modulare)', pairWith: '12' }
];

export const PRESET_COMBOS = [
  { id: 'combo-7-8', label: 'Tavoli 8 + 7 (Uniti - 4 pax)', tables: ['8', '7'], capacity: 4 },
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (Uniti - 4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-12-13', label: 'Saletta 12 + 13 (Uniti - 4 pax)', tables: ['12', '13'], capacity: 4 },
  { id: 'combo-12-13-14', label: 'Saletta Intera 12 + 13 + 14 (6 pax)', tables: ['12', '13', '14'], capacity: 6 },
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (4 pax)', tables: ['2', '3'], capacity: 4 },
  { id: 'combo-3-4', label: 'Tavoli 3 + 4 (4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Parete Destra 2 + 3 + 4 (6 pax)', tables: ['2', '3', '4'], capacity: 6 },
  { id: 'combo-9-8-7', label: 'Blocco Sinistro 9 + 8 + 7 (6 pax)', tables: ['9', '8', '7'], capacity: 6 },
  { id: 'combo-5-6', label: 'Tavoli 5 + 6 (4 pax)', tables: ['5', '6'], capacity: 4 }
];

export default function TablePlan({ selectedTables = [], onToggleTable, guests, occupiedTables = [] }) {
  const [hoveredTable, setHoveredTable] = useState(null);

  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  const totalSeats = TABLES.length * 2;
  const selectedPax = selectedTables.reduce((acc, tid) => {
    const t = TABLES.find(item => item.id === tid);
    return acc + (t ? t.pax : 2);
  }, 0);

  return (
    <div style={{ 
      background: '#FFFFFF', 
      border: '1px solid #E5E7EB', 
      borderRadius: '8px', 
      padding: '24px', 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      position: 'relative' 
    }}>
      {/* Header bar matching Figma design */}
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
            color: '#6B7280', 
            marginBottom: '4px' 
          }}>
            Planimetria della sala
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: '#111827', 
            margin: '0 0 4px 0', 
            fontFamily: 'serif' 
          }}>
            I Pupi Siciliani · Odense
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Gestione tavoli - sala principale
          </p>
        </div>

        {/* Legend & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: '#4B5563' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#DCEBE1', border: '1px solid #A8C4B2', borderRadius: '2px' }}></span> Libero
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#FDB4BF', border: '1px solid #1E1E1E', borderRadius: '2px' }}></span> Selezionato
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '2px' }}></span> Occupato
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
            Tavoli scelti: <strong style={{ color: '#111827' }}>{selectedTables.join(', ') || 'Nessuno'}</strong> ({selectedPax} / {totalSeats} pax)
          </div>
        </div>
      </div>

      {/* Blue accent underline matching Figma */}
      <div style={{ width: '180px', height: '3px', background: '#0084FF', borderRadius: '2px', marginBottom: '20px' }}></div>

      {/* SVG Canvas Matching 1:1 the Figma Mockup */}
      <svg 
        viewBox="0 0 1000 620" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          display: 'block', 
          background: '#FAFAFA', 
          borderRadius: '6px', 
          border: '1px solid #E5E7EB' 
        }}
      >
        <defs>
          <filter id="tableShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Outer Hall Boundary */}
        <rect x="36" y="90" width="928" height="490" fill="#FFFFFF" stroke="#BAC7BE" strokeWidth="1.5" rx="4" />

        {/* Vetrate (Left Glass Bar) */}
        <g>
          <text x="180" y="80" fill="#6B7280" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.05em">
            Vetrate
          </text>
          <rect x="46" y="88" width="280" height="8" fill="#95C1D8" rx="2" />
        </g>

        {/* Entrata Doorway (Center) */}
        <g>
          <text x="380" y="80" fill="#111827" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.06em">
            Entrata
          </text>
          <rect x="330" y="88" width="100" height="8" fill="#FFFFFF" />
          <line x1="330" y1="92" x2="430" y2="92" stroke="#BAC7BE" strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* Vetrate (Right Glass Bar) */}
        <g>
          <text x="695" y="80" fill="#6B7280" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.05em">
            Vetrate
          </text>
          <rect x="434" y="88" width="520" height="8" fill="#95C1D8" rx="2" />
        </g>

        {/* Left Cutout Gray Area */}
        <rect x="46" y="350" width="165" height="220" fill="#E8EDE9" stroke="#BAC7BE" strokeWidth="1.2" rx="2" />

        {/* Bottom-Right Kitchen / Corridor Gray Block */}
        <rect x="465" y="350" width="489" height="220" fill="#E8EDE9" stroke="#BAC7BE" strokeWidth="1.2" rx="2" />
        <text x="710" y="455" fill="#8B9B90" fontSize="14" fontWeight="600" textAnchor="middle" letterSpacing="0.06em">
          Cucina & Servizi
        </text>

        {/* Table Pair Connector Indicators */}
        {/* Pair 10-11 */}
        <rect x="140" y="133" width="86" height="46" fill="none" stroke="#BAC7BE" strokeWidth="1" strokeDasharray="2 2" rx="4" />
        {/* Pair 8-7 */}
        <rect x="106" y="238" width="46" height="100" fill="none" stroke="#BAC7BE" strokeWidth="1" strokeDasharray="2 2" rx="4" />
        {/* Pair 12-13 */}
        <rect x="234" y="503" width="86" height="46" fill="none" stroke="#BAC7BE" strokeWidth="1" strokeDasharray="2 2" rx="4" />

        {/* Tables */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);
          const hovered = hoveredTable?.id === t.id;

          let fill = '#DCEBE1';
          let stroke = '#A8C4B2';
          let textColor = '#2D3B32';

          if (occupied) {
            fill = '#F3F4F6';
            stroke = '#D1D5DB';
            textColor = '#9CA3AF';
          } else if (selected) {
            fill = '#FDB4BF';
            stroke = '#1E1E1E';
            textColor = '#1E1E1E';
          } else if (hovered) {
            fill = '#CFE5D6';
            stroke = '#80A891';
          }

          return (
            <g
              key={t.id}
              onClick={() => !occupied && onToggleTable && onToggleTable(t.id)}
              onMouseEnter={() => setHoveredTable(t)}
              onMouseLeave={() => setHoveredTable(null)}
              style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
            >
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx="5"
                fill={fill}
                stroke={stroke}
                strokeWidth={selected ? 2 : 1.2}
                filter="url(#tableShadow)"
              />
              <text
                x={t.x + t.w / 2}
                y={t.y + t.h / 2 + 5}
                fill={textColor}
                fontSize="13"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {t.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Footer matching Figma */}
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
          <span style={{ fontWeight: 500 }}>Elementi numerati</span>
        </div>
        <div>
          Schema non in scala
        </div>
      </div>
    </div>
  );
}
