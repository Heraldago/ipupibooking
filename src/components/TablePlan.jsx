import React from 'react';

export const TABLES = [
  // Vetrate / Parete Superiore
  { id: '9', name: 'Tavolo 9', pax: 2, x: 105, y: 110, w: 58, h: 58, zone: 'Vetrate Sinistra' },
  { id: '10', name: 'Tavolo 10', pax: 2, x: 195, y: 110, w: 56, h: 58, zone: 'Ingresso / Vetrate' },
  { id: '11', name: 'Tavolo 11', pax: 2, x: 253, y: 110, w: 56, h: 58, zone: 'Ingresso / Vetrate' },

  // Parete Sinistra
  { id: '7', name: 'Tavolo 7', pax: 2, x: 105, y: 225, w: 58, h: 56, zone: 'Parete Sinistra' },
  { id: '8', name: 'Tavolo 8', pax: 2, x: 105, y: 283, w: 58, h: 56, zone: 'Parete Sinistra' },

  // Centro Sala (Staggered / Diagonale)
  { id: '5', name: 'Tavolo 5', pax: 2, x: 450, y: 200, w: 58, h: 58, zone: 'Centro Sala' },
  { id: '6', name: 'Tavolo 6', pax: 2, x: 375, y: 305, w: 58, h: 58, zone: 'Centro Sala' },

  // Parete Destra
  { id: '2', name: 'Tavolo 2', pax: 2, x: 590, y: 100, w: 58, h: 58, zone: 'Vetrate Destra' },
  { id: '3', name: 'Tavolo 3', pax: 2, x: 590, y: 200, w: 58, h: 58, zone: 'Parete Destra' },
  { id: '4', name: 'Tavolo 4', pax: 2, x: 590, y: 305, w: 58, h: 58, zone: 'Parete Destra' },

  // Zona Fondo / Saletta (accanto a corridoio cucina)
  { id: '14', name: 'Tavolo 14', pax: 2, x: 235, y: 465, w: 58, h: 58, zone: 'Zona Fondo' },
  { id: '12', name: 'Tavolo 12', pax: 2, x: 235, y: 670, w: 56, h: 58, zone: 'Saletta Fondo' },
  { id: '13', name: 'Tavolo 13', pax: 2, x: 293, y: 670, w: 56, h: 58, zone: 'Saletta Fondo' }
];

export const PRESET_COMBOS = [
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (Uniti - 4 pax)', tables: ['10', '11'], capacity: 4, zone: 'Ingresso / Vetrate' },
  { id: 'combo-7-8', label: 'Tavoli 7 + 8 (Uniti - 4 pax)', tables: ['7', '8'], capacity: 4, zone: 'Parete Sinistra' },
  { id: 'combo-12-13', label: 'Tavoli 12 + 13 (Uniti - 4 pax)', tables: ['12', '13'], capacity: 4, zone: 'Saletta Fondo' },
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (Uniti - 4 pax)', tables: ['2', '3'], capacity: 4, zone: 'Parete Destra' },
  { id: 'combo-3-4', label: 'Tavoli 3 + 4 (Uniti - 4 pax)', tables: ['3', '4'], capacity: 4, zone: 'Parete Destra' },
  { id: 'combo-2-3-4', label: 'Tavolata 2 + 3 + 4 (6 pax)', tables: ['2', '3', '4'], capacity: 6, zone: 'Parete Destra' },
  { id: 'combo-9-10-11', label: 'Tavolata 9 + 10 + 11 (6 pax)', tables: ['9', '10', '11'], capacity: 6, zone: 'Vetrate / Ingresso' },
  { id: 'combo-12-13-14', label: 'Saletta 12 + 13 + 14 (6 pax)', tables: ['12', '13', '14'], capacity: 6, zone: 'Saletta Fondo' },
  { id: 'combo-5-6', label: 'Tavoli 5 + 6 (Uniti - 4 pax)', tables: ['5', '6'], capacity: 4, zone: 'Centro Sala' }
];

export default function TablePlan({ selectedTables, onToggleTable, guests, occupiedTables = [] }) {
  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  return (
    <div style={{ background: '#F8F9FA', border: '1px solid #D1D5DB', padding: '24px 16px', overflowX: 'auto' }}>
      {/* Legend & status */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', fontSize: '13px', color: '#666666', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', background: '#4A3F35', border: '1px solid #333333' }}></span> Libero
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', background: '#FDB4BF', border: '1px solid #333333' }}></span> Selezionato
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', background: '#E5E7EB', border: '1px solid #D1D5DB' }}></span> Occupato
        </span>
        <span style={{ color: 'var(--color-accent-gold-dark, #8F822E)', fontWeight: 700 }}>
          Modularita attiva: {guests} pax
        </span>
      </div>

      <svg viewBox="0 0 760 840" style={{ width: '100%', maxWidth: '720px', margin: '0 auto', display: 'block', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        {/* Exterior dark boundary context like drawing */}
        <defs>
          <pattern id="doorHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#E5E7EB" strokeWidth="2" />
          </pattern>
        </defs>

        {/* Floor polygon (Main room + bottom alcove + kitchen corridor) */}
        {/* Top wall: 70 to 680 at Y=70 */}
        {/* Right wall: from (680, 70) down to (680, 780) */}
        {/* Bottom wall: from (680, 780) to (200, 780) */}
        {/* Left wall: from (200, 780) up to (200, 420), then steps left to (70, 420), up to (70, 70) */}
        <polygon
          points="70,70 680,70 680,780 200,780 200,420 70,420"
          fill="#FFFFFF"
          stroke="#1E1E1E"
          strokeWidth="3"
        />

        {/* Cutout area outside bottom-left corner */}
        <polygon
          points="0,420 200,420 200,840 0,840"
          fill="#F3F4F6"
        />
        <line x1="70" y1="420" x2="200" y2="420" stroke="#1E1E1E" strokeWidth="3" />
        <line x1="200" y1="420" x2="200" y2="780" stroke="#1E1E1E" strokeWidth="3" />
        <line x1="200" y1="780" x2="680" y2="780" stroke="#1E1E1E" strokeWidth="3" />

        {/* Dividing Wall: corridoio bagno + cucina */}
        {/* Horizontal segment from (365, 430) to (680, 430) */}
        <line x1="365" y1="430" x2="680" y2="430" stroke="#1E1E1E" strokeWidth="4" />
        
        {/* Vertical segment: top section (430 to 550) */}
        <line x1="365" y1="430" x2="365" y2="550" stroke="#1E1E1E" strokeWidth="4" />
        
        {/* Door opening between 550 and 640 */}
        <path d="M 365 550 A 60 60 0 0 1 365 610" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Vertical segment: bottom section (640 to 780) */}
        <line x1="365" y1="640" x2="365" y2="780" stroke="#1E1E1E" strokeWidth="4" />

        {/* Corridor & Kitchen Text */}
        <text x="522" y="585" fill="#1E1E1E" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          corridoio bagno
        </text>
        <text x="522" y="618" fill="#1E1E1E" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          + cucina
        </text>

        {/* Top Header Labels */}
        {/* Vetrate (Left) */}
        <text x="134" y="44" fill="#1E1E1E" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        <line x1="85" y1="70" x2="185" y2="70" stroke="#B5A642" strokeWidth="5" />

        {/* Entrata (Center) */}
        <text x="325" y="44" fill="#1E1E1E" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Entrata
        </text>
        <line x1="300" y1="70" x2="350" y2="70" stroke="#FFFFFF" strokeWidth="5" />
        <polygon points="325,78 320,68 330,68" fill="#1E1E1E" />

        {/* Vetrate (Right) */}
        <text x="619" y="44" fill="#1E1E1E" fontSize="18" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        <line x1="570" y1="70" x2="665" y2="70" stroke="#B5A642" strokeWidth="5" />

        {/* Connection indicators for modular tables */}
        {/* 10 & 11 bridge */}
        <line x1="251" y1="110" x2="251" y2="168" stroke="#333333" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        {/* 7 & 8 bridge */}
        <line x1="105" y1="281" x2="163" y2="281" stroke="#333333" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        {/* 12 & 13 bridge */}
        <line x1="291" y1="670" x2="291" y2="728" stroke="#333333" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

        {/* Tables */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);

          const fillColor = occupied ? '#E5E7EB' : selected ? '#FDB4BF' : '#4A3F35';
          const textColor = occupied ? '#9CA3AF' : selected ? '#1E1E1E' : '#FFFFFF';
          const strokeColor = selected ? '#1E1E1E' : occupied ? '#D1D5DB' : '#333333';
          const strokeWidth = selected ? '3' : '1.5';

          return (
            <g
              key={t.id}
              style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
              onClick={() => !occupied && onToggleTable(t.id)}
            >
              {/* Table Rectangle (squadrato, no border-radius) */}
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />

              {/* Table Number */}
              <text
                x={t.x + t.w / 2}
                y={t.y + t.h / 2 + 7}
                fill={textColor}
                fontSize="20"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {t.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
