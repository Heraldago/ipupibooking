import React from 'react';

export const TABLES = [
  // Top Wall (Vindegade windows)
  { id: '9', name: 'Tavolo 9', pax: 2, x: 260, y: 70, w: 60, h: 60, zone: 'Vindegade (Vetrate)' },
  { id: '10', name: 'Tavolo 10', pax: 2, x: 380, y: 70, w: 60, h: 60, zone: 'Vindegade (Vetrate)' },
  { id: '11', name: 'Tavolo 11', pax: 2, x: 500, y: 70, w: 60, h: 60, zone: 'Vindegade (Vetrate)' },

  // Left Wall
  { id: '7', name: 'Tavolo 7', pax: 2, x: 90, y: 190, w: 60, h: 60, zone: 'Sala Principale' },
  { id: '8', name: 'Tavolo 8', pax: 2, x: 90, y: 280, w: 60, h: 60, zone: 'Sala Principale' },

  // Center
  { id: '5', name: 'Tavolo 5', pax: 2, x: 320, y: 240, w: 60, h: 60, zone: 'Sala Principale' },
  { id: '6', name: 'Tavolo 6', pax: 2, x: 440, y: 240, w: 60, h: 60, zone: 'Sala Principale' },

  // Right Wall
  { id: '4', name: 'Tavolo 4', pax: 2, x: 600, y: 190, w: 60, h: 60, zone: 'Sala Principale' },
  { id: '3', name: 'Tavolo 3', pax: 2, x: 600, y: 280, w: 60, h: 60, zone: 'Sala Principale' },
  { id: '2', name: 'Tavolo 2', pax: 2, x: 600, y: 370, w: 60, h: 60, zone: 'Sala Principale' },

  // Saletta (Private room)
  { id: '14', name: 'Tavolo 14', pax: 2, x: 740, y: 150, w: 60, h: 60, zone: 'Saletta Riservata' },
  { id: '12', name: 'Tavolo 12', pax: 2, x: 740, y: 250, w: 60, h: 60, zone: 'Saletta Riservata' },
  { id: '13', name: 'Tavolo 13', pax: 2, x: 740, y: 340, w: 60, h: 60, zone: 'Saletta Riservata' },
];

export const PRESET_COMBOS = [
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (Uniti - 4 pax)', tables: ['2', '3'], capacity: 4, zone: 'Sala Principale' },
  { id: 'combo-7-8', label: 'Tavoli 7 + 8 (Uniti - 4 pax)', tables: ['7', '8'], capacity: 4, zone: 'Sala Principale' },
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (Uniti - 4 pax)', tables: ['10', '11'], capacity: 4, zone: 'Vetrate Vindegade' },
  { id: 'combo-9-10-11', label: 'Tavoli 9 + 10 + 11 (Tavolata 6 pax)', tables: ['9', '10', '11'], capacity: 6, zone: 'Vetrate Vindegade' },
  { id: 'combo-4-5-6', label: 'Tavoli 4 + 5 + 6 (Gruppo 7/8 pax)', tables: ['4', '5', '6'], capacity: 8, zone: 'Sala Principale' },
  { id: 'combo-12-13', label: 'Saletta 12 + 13 (Uniti - 5 pax)', tables: ['12', '13'], capacity: 5, zone: 'Saletta Riservata' },
  { id: 'combo-12-13-14', label: 'Saletta Intera (12+13+14 - 8/10 pax)', tables: ['12', '13', '14'], capacity: 8, zone: 'Saletta Riservata' },
];

export default function TablePlan({ selectedTables, onToggleTable, guests, occupiedTables = [] }) {
  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  return (
    <div style={{ background: '#FFF5F6', border: '1px solid #D1D5DB', borderRadius: '3px', padding: '24px 16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', fontSize: '13px', color: '#666666', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '2px' }}></span> Libero
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FDB4BF', border: '1px solid #333333', borderRadius: '2px' }}></span> Selezionato
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#E5E7EB', borderRadius: '2px' }}></span> Occupato
        </span>
        <span style={{ color: '#B5A642', fontWeight: 700 }}>
          ✦ Modularità attiva ({guests} pax)
        </span>
      </div>

      <svg viewBox="0 0 860 480" style={{ width: '100%', maxWidth: '780px', margin: '0 auto', display: 'block' }}>
        {/* Room Boundaries */}
        <rect x="30" y="20" width="670" height="430" rx="3" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        
        {/* Vindegade Windows */}
        <path d="M 230 20 L 590 20" stroke="#B5A642" strokeWidth="4" strokeDasharray="8 6" />
        <text x="410" y="42" fill="#B5A642" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.08em" fontFamily="Lato, sans-serif">
          FINESTRE SU VINDEGADE
        </text>

        {/* Entrance */}
        <text x="60" y="440" fill="#666666" fontSize="11" fontWeight="700" letterSpacing="0.06em" fontFamily="Lato, sans-serif">
          INGRESSO / GUARDAROBA
        </text>

        {/* Saletta Boundary */}
        <rect x="710" y="100" width="130" height="320" rx="3" fill="#FFF5F6" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="775" y="126" fill="#333333" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="0.05em" fontFamily="Lato, sans-serif">
          SALETTA
        </text>
        <text x="775" y="140" fill="#666666" fontSize="10" textAnchor="middle" fontFamily="Lato, sans-serif">
          Riservata (fino a 8 pax)
        </text>

        {/* Connection hints for modular combos */}
        <line x1="630" y1="310" x2="630" y2="370" stroke="#B5A642" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        <line x1="120" y1="250" x2="120" y2="280" stroke="#B5A642" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        <line x1="770" y1="210" x2="770" y2="340" stroke="#B5A642" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />

        {/* Table Nodes */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);

          return (
            <g
              key={t.id}
              style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
              onClick={() => !occupied && onToggleTable(t.id)}
            >
              {/* Chair dots */}
              <circle cx={t.x + t.w / 2} cy={t.y - 8} r="5" fill={selected ? '#333333' : '#D1D5DB'} />
              <circle cx={t.x + t.w / 2} cy={t.y + t.h + 8} r="5" fill={selected ? '#333333' : '#D1D5DB'} />

              {/* Table Body */}
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx="3"
                fill={selected ? '#FDB4BF' : '#FFFFFF'}
                stroke={selected ? '#333333' : '#D1D5DB'}
                strokeWidth={selected ? '2' : '1'}
              />

              {/* Table ID and capacity */}
              <text
                x={t.x + t.w / 2}
                y={t.y + 26}
                fill="#333333"
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Lato, sans-serif"
              >
                T{t.id}
              </text>
              <text
                x={t.x + t.w / 2}
                y={t.y + 44}
                fill={selected ? '#333333' : '#666666'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Lato, sans-serif"
              >
                {t.pax} pax
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
