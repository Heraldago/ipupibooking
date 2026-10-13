import React, { useState } from 'react';

export const TABLES = [
  // Vetrate / Parete Superiore
  { id: '9', name: 'Tavolo 9', pax: 2, x: 110, y: 125, w: 60, h: 60, zone: 'Vetrate Sinistra', chairs: 'vertical' },
  { id: '10', name: 'Tavolo 10', pax: 2, x: 200, y: 125, w: 58, h: 60, zone: 'Ingresso / Vetrate', chairs: 'vertical' },
  { id: '11', name: 'Tavolo 11', pax: 2, x: 258, y: 125, w: 58, h: 60, zone: 'Ingresso / Vetrate', chairs: 'vertical' },

  // Parete Sinistra
  { id: '7', name: 'Tavolo 7', pax: 2, x: 110, y: 245, w: 60, h: 58, zone: 'Parete Sinistra', chairs: 'horizontal' },
  { id: '8', name: 'Tavolo 8', pax: 2, x: 110, y: 303, w: 60, h: 58, zone: 'Parete Sinistra', chairs: 'horizontal' },

  // Centro Sala (Diagonale / A scalare)
  { id: '5', name: 'Tavolo 5', pax: 2, x: 465, y: 215, w: 60, h: 60, zone: 'Centro Sala', chairs: 'vertical' },
  { id: '6', name: 'Tavolo 6', pax: 2, x: 390, y: 325, w: 60, h: 60, zone: 'Centro Sala', chairs: 'vertical' },

  // Parete Destra
  { id: '2', name: 'Tavolo 2', pax: 2, x: 595, y: 115, w: 60, h: 60, zone: 'Vetrate Destra', chairs: 'horizontal' },
  { id: '3', name: 'Tavolo 3', pax: 2, x: 595, y: 215, w: 60, h: 60, zone: 'Parete Destra', chairs: 'horizontal' },
  { id: '4', name: 'Tavolo 4', pax: 2, x: 595, y: 325, w: 60, h: 60, zone: 'Parete Destra', chairs: 'horizontal' },

  // Zona Fondo / Saletta
  { id: '14', name: 'Tavolo 14', pax: 2, x: 245, y: 495, w: 60, h: 60, zone: 'Nicchia Fondo', chairs: 'vertical' },
  { id: '12', name: 'Tavolo 12', pax: 2, x: 245, y: 710, w: 58, h: 60, zone: 'Saletta Fondo', chairs: 'vertical' },
  { id: '13', name: 'Tavolo 13', pax: 2, x: 303, y: 710, w: 58, h: 60, zone: 'Saletta Fondo', chairs: 'vertical' }
];

export const PRESET_COMBOS = [
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-7-8', label: 'Tavoli 7 + 8 (4 pax)', tables: ['7', '8'], capacity: 4 },
  { id: 'combo-12-13', label: 'Tavoli 12 + 13 (4 pax)', tables: ['12', '13'], capacity: 4 },
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (4 pax)', tables: ['2', '3'], capacity: 4 },
  { id: 'combo-3-4', label: 'Tavoli 3 + 4 (4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Tavolata 2 + 3 + 4 (6 pax)', tables: ['2', '3', '4'], capacity: 6 },
  { id: 'combo-9-10-11', label: 'Tavolata 9 + 10 + 11 (6 pax)', tables: ['9', '10', '11'], capacity: 6 },
  { id: 'combo-12-13-14', label: 'Saletta 12 + 13 + 14 (6 pax)', tables: ['12', '13', '14'], capacity: 6 },
  { id: 'combo-5-6', label: 'Tavoli 5 + 6 (4 pax)', tables: ['5', '6'], capacity: 4 }
];

export default function TablePlan({ selectedTables, onToggleTable, guests, occupiedTables = [] }) {
  const [hoveredTable, setHoveredTable] = useState(null);

  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  const totalSeats = TABLES.length * 2;
  const selectedPax = selectedTables.reduce((acc, tid) => {
    const t = TABLES.find(item => item.id === tid);
    return acc + (t ? t.pax : 2);
  }, 0);

  return (
    <div style={{ background: '#FAF8F5', border: '1px solid #D1D5DB', padding: '24px 16px', position: 'relative' }}>
      
      {/* Top Architectural Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        flexWrap: 'wrap', 
        gap: '12px',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '14px'
      }}>
        {/* Status Legend */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', color: '#4B5563' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#3A3027', border: '1px solid #1A1A1A' }}></span> Libero
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#FDB4BF', border: '2px solid #1A1A1A' }}></span> Selezionato
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#E5E7EB', border: '1px solid #D1D5DB' }}></span> Occupato
          </span>
        </div>

        {/* Live Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          <span style={{ color: '#6B7280' }}>
            Posti selezionati: <strong style={{ color: '#111111' }}>{selectedPax} / {totalSeats} pax</strong>
          </span>
          {hoveredTable && (
            <span style={{ background: '#FFFFFF', padding: '3px 10px', border: '1px solid #B5A642', color: '#8F822E', fontWeight: 700 }}>
              {hoveredTable.name} ({hoveredTable.zone})
            </span>
          )}
        </div>
      </div>

      {/* Architectural Plan SVG */}
      <svg 
        viewBox="0 0 780 870" 
        style={{ 
          width: '100%', 
          maxWidth: '740px', 
          margin: '0 auto', 
          display: 'block', 
          background: '#FFFFFF', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E5E7EB'
        }}
      >
        <defs>
          {/* Subtle architectural floor grid */}
          <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F4F2EE" strokeWidth="0.8" />
          </pattern>

          {/* Kitchen tile hatch */}
          <pattern id="kitchenHatch" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#F9F8F6" />
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#EFECE6" strokeWidth="1" />
          </pattern>

          {/* Active selection glow filter */}
          <filter id="selectGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B5A642" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer background context */}
        <rect x="0" y="0" width="780" height="870" fill="#F8F6F2" />

        {/* Main Floor Polygon with subtle architectural grid */}
        <polygon
          points="70,80 690,80 690,820 210,820 210,430 70,430"
          fill="#FFFFFF"
        />
        <polygon
          points="70,80 690,80 690,820 210,820 210,430 70,430"
          fill="url(#archGrid)"
        />

        {/* Corridoio bagno + cucina area fill */}
        <rect x="375" y="430" width="315" height="390" fill="url(#kitchenHatch)" />

        {/* Structural Walls (Thick black architectural lines) */}
        {/* Left main wall */}
        <line x1="70" y1="80" x2="70" y2="430" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Step inward */}
        <line x1="70" y1="430" x2="210" y2="430" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="210" y1="430" x2="210" y2="820" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="210" y1="820" x2="690" y2="820" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="690" y1="820" x2="690" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Top Wall with Entrance Opening */}
        <line x1="70" y1="80" x2="310" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="365" y1="80" x2="690" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Dividing Wall: Corridoio bagno + cucina */}
        {/* Horizontal dividing wall */}
        <line x1="375" y1="430" x2="690" y2="430" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Vertical dividing wall with door opening */}
        <line x1="375" y1="430" x2="375" y2="570" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Door swing arc for corridor */}
        <path d="M 375 570 A 70 70 0 0 1 445 640" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="375" y1="570" x2="445" y2="570" stroke="#6B7280" strokeWidth="1.5" />
        
        <line x1="375" y1="640" x2="375" y2="820" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Corridoio bagno + cucina labels */}
        <g style={{ userSelect: 'none', pointerEvents: 'none' }}>
          <text x="532" y="605" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
            corridoio bagno
          </text>
          <text x="532" y="635" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
            + cucina
          </text>
          <rect x="472" y="660" width="120" height="24" fill="#EFECE6" stroke="#D1D5DB" />
          <text x="532" y="676" fill="#6B7280" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
            ZONA RISERVATA
          </text>
        </g>

        {/* Top Header Labels & Window Glass Highlights */}
        {/* Vetrate (Left) */}
        <text x="145" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        {/* Golden bar under Vetrate */}
        <rect x="85" y="62" width="120" height="4" fill="#C5A85A" />
        {/* Architectural double glass window */}
        <line x1="85" y1="80" x2="205" y2="80" stroke="#C5A85A" strokeWidth="6" />
        <line x1="85" y1="76" x2="205" y2="76" stroke="#E8DFB8" strokeWidth="2" />

        {/* Entrata (Center) */}
        <text x="338" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Entrata
        </text>
        {/* Triangle pointer */}
        <polygon points="338,72 331,58 345,58" fill="#1A1A1A" />
        {/* Door threshold lines */}
        <line x1="310" y1="80" x2="365" y2="80" stroke="#B5A642" strokeWidth="2" strokeDasharray="4 3" />

        {/* Vetrate (Right) */}
        <text x="625" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        {/* Golden bar under Vetrate */}
        <rect x="565" y="62" width="120" height="4" fill="#C5A85A" />
        {/* Architectural double glass window */}
        <line x1="565" y1="80" x2="685" y2="80" stroke="#C5A85A" strokeWidth="6" />
        <line x1="565" y1="76" x2="685" y2="76" stroke="#E8DFB8" strokeWidth="2" />

        {/* Modular Connection Bridges */}
        {/* 10 & 11 bridge */}
        <line x1="258" y1="125" x2="258" y2="185" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* 7 & 8 bridge */}
        <line x1="110" y1="303" x2="170" y2="303" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* 12 & 13 bridge */}
        <line x1="303" y1="710" x2="303" y2="770" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Tables & Architectural Chairs */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);

          const tableFill = occupied ? '#E5E7EB' : selected ? '#FDB4BF' : '#3A3027';
          const tableStroke = selected ? '#1A1A1A' : occupied ? '#D1D5DB' : '#231D17';
          const textFill = occupied ? '#9CA3AF' : selected ? '#1A1A1A' : '#FFFFFF';
          const chairFill = occupied ? '#D1D5DB' : selected ? '#1A1A1A' : '#6B5848';

          return (
            <g
              key={t.id}
              style={{ cursor: occupied ? 'not-allowed' : 'pointer' }}
              onClick={() => !occupied && onToggleTable(t.id)}
              onMouseEnter={() => setHoveredTable(t)}
              onMouseLeave={() => setHoveredTable(null)}
            >
              {/* Architectural Chairs */}
              {t.chairs === 'vertical' ? (
                <>
                  {/* Top Chair */}
                  <rect
                    x={t.x + (t.w - 32) / 2}
                    y={t.y - 7}
                    width={32}
                    height={5}
                    fill={chairFill}
                  />
                  {/* Bottom Chair */}
                  <rect
                    x={t.x + (t.w - 32) / 2}
                    y={t.y + t.h + 2}
                    width={32}
                    height={5}
                    fill={chairFill}
                  />
                </>
              ) : (
                <>
                  {/* Left Chair */}
                  <rect
                    x={t.x - 7}
                    y={t.y + (t.h - 32) / 2}
                    width={5}
                    height={32}
                    fill={chairFill}
                  />
                  {/* Right Chair */}
                  <rect
                    x={t.x + t.w + 2}
                    y={t.y + (t.h - 32) / 2}
                    width={5}
                    height={32}
                    fill={chairFill}
                  />
                </>
              )}

              {/* Table Rectangle (squadrato, no border-radius) */}
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                fill={tableFill}
                stroke={tableStroke}
                strokeWidth={selected ? 3 : 1.5}
                filter={selected ? 'url(#selectGlow)' : undefined}
              />

              {/* Table Inner Bevel Line */}
              {!selected && !occupied && (
                <rect
                  x={t.x + 3}
                  y={t.y + 3}
                  width={t.w - 6}
                  height={t.h - 6}
                  fill="none"
                  stroke="#4E4135"
                  strokeWidth="1"
                  opacity="0.8"
                />
              )}

              {/* Table Number */}
              <text
                x={t.x + t.w / 2}
                y={t.y + t.h / 2 + 7}
                fill={textFill}
                fontSize="21"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
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
