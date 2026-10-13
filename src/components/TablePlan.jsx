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
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (Uniti)', tables: ['2', '3'], capacity: 4, zone: 'Sala Principale' },
  { id: 'combo-7-8', label: 'Tavoli 7 + 8 (Uniti)', tables: ['7', '8'], capacity: 4, zone: 'Sala Principale' },
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (Uniti)', tables: ['10', '11'], capacity: 4, zone: 'Vetrate Vindegade' },
  { id: 'combo-9-10-11', label: 'Tavoli 9 + 10 + 11 (Tavolata 6)', tables: ['9', '10', '11'], capacity: 6, zone: 'Vetrate Vindegade' },
  { id: 'combo-4-5-6', label: 'Tavoli 4 + 5 + 6 (Gruppo 7/8)', tables: ['4', '5', '6'], capacity: 8, zone: 'Sala Principale' },
  { id: 'combo-12-13', label: 'Saletta 12 + 13 (Uniti)', tables: ['12', '13'], capacity: 5, zone: 'Saletta Riservata' },
  { id: 'combo-12-13-14', label: 'Saletta Privata Intera (12+13+14)', tables: ['12', '13', '14'], capacity: 8, zone: 'Saletta Riservata' },
];

export default function TablePlan({ selectedTables, onToggleTable, guests, occupiedTables = [] }) {
  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  return (
    <div className="map-container">
      <div className="map-legend">
        <span className="legend-item">
          <span className="legend-dot avail"></span> Disponibile
        </span>
        <span className="legend-item">
          <span className="legend-dot selected"></span> Selezionato
        </span>
        <span className="legend-item">
          <span className="legend-dot occupied"></span> Occupato
        </span>
        {guests > 2 && (
          <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.85rem' }}>
            ✦ Modalità modulare attiva per {guests} persone
          </span>
        )}
      </div>

      <svg viewBox="0 0 860 480" className="table-svg">
        <defs>
          <filter id="shadow" x="-8%" y="-8%" width="116%" height="116%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3D2319" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Room Boundaries */}
        <rect x="30" y="20" width="670" height="430" rx="16" fill="#FFFFFF" stroke="#EAE0DC" strokeWidth="2" />
        
        {/* Vindegade Windows Tag */}
        <path d="M 230 20 L 590 20" stroke="#C27060" strokeWidth="4" strokeDasharray="8 6" />
        <text x="410" y="42" fill="#7E6258" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="0.08em">
          FINESTRE SU VINDEGADE
        </text>

        {/* Entrance */}
        <text x="60" y="440" fill="#A38C84" fontSize="11" fontWeight="600" letterSpacing="0.06em">
          INGRESSO / GUARDAROBA
        </text>

        {/* Saletta Boundary */}
        <rect x="710" y="100" width="130" height="320" rx="14" fill="#FAF2EE" stroke="#E2D4CD" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x="775" y="126" fill="#3D2319" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
          SALETTA
        </text>
        <text x="775" y="140" fill="#7E6258" fontSize="9" textAnchor="middle">
          Riservata (fino a 8 pax)
        </text>

        {/* Connection hints for modular combos */}
        {guests >= 4 && (
          <>
            <line x1="630" y1="310" x2="630" y2="370" stroke="#C27060" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
            <line x1="120" y1="250" x2="120" y2="280" stroke="#C27060" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
            <line x1="770" y1="210" x2="770" y2="340" stroke="#C27060" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
          </>
        )}

        {/* Table Nodes */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);

          return (
            <g
              key={t.id}
              className={`table-node ${selected ? 'selected' : ''} ${occupied ? 'occupied' : ''}`}
              onClick={() => !occupied && onToggleTable(t.id)}
            >
              {/* Chair dots */}
              <circle cx={t.x + t.w / 2} cy={t.y - 8} r="5" fill={selected ? '#24140E' : '#E2D4CD'} />
              <circle cx={t.x + t.w / 2} cy={t.y + t.h + 8} r="5" fill={selected ? '#24140E' : '#E2D4CD'} />

              {/* Table Body */}
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx="12"
                fill={selected ? '#24140E' : '#FFFFFF'}
                stroke={selected ? '#C27060' : '#DCCDC6'}
                strokeWidth={selected ? '2.5' : '1.5'}
                filter="url(#shadow)"
              />

              {/* Table ID and capacity */}
              <text
                x={t.x + t.w / 2}
                y={t.y + 26}
                fill={selected ? '#FFFFFF' : '#24140E'}
                fontSize="15"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Cormorant Garamond, serif"
              >
                T{t.id}
              </text>
              <text
                x={t.x + t.w / 2}
                y={t.y + 44}
                fill={selected ? '#F4DFDB' : '#7E6258'}
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
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
