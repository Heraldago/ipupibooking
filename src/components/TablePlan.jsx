import React, { useState } from 'react';

export const TABLES = [
  // Sinistra / Vetrate Superiore
  // Il 9 va esattamente sopra a 7 e 8 (stesso asse X, sopra)
  { id: '9', name: 'Tavolo 9', pax: 2, x: 105, y: 125, w: 64, h: 60, zone: 'Vetrate Sinistra', chairs: 'vertical' },

  // 10 e 11 sono di fianco a 9 in alto, quasi sempre attaccati
  { id: '10', name: 'Tavolo 10', pax: 2, x: 200, y: 125, w: 58, h: 60, zone: 'Ingresso / Vetrate', chairs: 'vertical', pairWith: '11' },
  { id: '11', name: 'Tavolo 11', pax: 2, x: 258, y: 125, w: 58, h: 60, zone: 'Ingresso / Vetrate', chairs: 'vertical', pairWith: '10' },

  // 7 e 8 sono sempre attaccati lungo la parete sinistra, subito sotto il 9
  { id: '7', name: 'Tavolo 7', pax: 2, x: 105, y: 245, w: 64, h: 58, zone: 'Parete Sinistra', chairs: 'horizontal', pairWith: '8' },
  { id: '8', name: 'Tavolo 8', pax: 2, x: 105, y: 303, w: 64, h: 58, zone: 'Parete Sinistra', chairs: 'horizontal', pairWith: '7' },

  // Centro e Parete divisoria (muro opposto alle finestre)
  // Il 5 in centro, il 6 appoggiato al muro divisorio
  { id: '5', name: 'Tavolo 5', pax: 2, x: 480, y: 235, w: 64, h: 60, zone: 'Centro Sala', chairs: 'vertical' },
  { id: '6', name: 'Tavolo 6', pax: 2, x: 420, y: 390, w: 64, h: 60, zone: 'Muro Divisorio', chairs: 'top-sides' },

  // Parete Destra
  // 2 dà sulla finestra in alto a destra
  { id: '2', name: 'Tavolo 2', pax: 2, x: 620, y: 125, w: 64, h: 60, zone: 'Vetrate Destra', chairs: 'horizontal' },
  // 3 in mezzo
  { id: '3', name: 'Tavolo 3', pax: 2, x: 620, y: 255, w: 64, h: 60, zone: 'Parete Destra', chairs: 'horizontal' },
  // 4 in fondo sul muro (lo stesso dove è appoggiato il 6)
  { id: '4', name: 'Tavolo 4', pax: 2, x: 620, y: 390, w: 64, h: 60, zone: 'Parete Destra / Angolo', chairs: 'horizontal' },

  // Saletta (sotto al centro-sinistra, tra 7-8 e 5-6)
  // 14 più o meno sempre solo
  { id: '14', name: 'Tavolo 14', pax: 2, x: 250, y: 510, w: 64, h: 60, zone: 'Saletta (Singolo)', chairs: 'vertical' },
  // 12 e 13 più o meno sempre insieme in fondo alla saletta
  { id: '12', name: 'Tavolo 12', pax: 2, x: 245, y: 720, w: 58, h: 60, zone: 'Saletta (Modulare)', chairs: 'vertical', pairWith: '13' },
  { id: '13', name: 'Tavolo 13', pax: 2, x: 303, y: 720, w: 58, h: 60, zone: 'Saletta (Modulare)', chairs: 'vertical', pairWith: '12' }
];

export const PRESET_COMBOS = [
  { id: 'combo-7-8', label: 'Tavoli 7 + 8 (Sempre Uniti - 4 pax)', tables: ['7', '8'], capacity: 4 },
  { id: 'combo-10-11', label: 'Tavoli 10 + 11 (Quasi sempre Uniti - 4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-12-13', label: 'Saletta 12 + 13 (Uniti - 4 pax)', tables: ['12', '13'], capacity: 4 },
  { id: 'combo-12-13-14', label: 'Saletta Intera 12 + 13 + 14 (6 pax)', tables: ['12', '13', '14'], capacity: 6 },
  { id: 'combo-2-3', label: 'Tavoli 2 + 3 (4 pax)', tables: ['2', '3'], capacity: 4 },
  { id: 'combo-3-4', label: 'Tavoli 3 + 4 (4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Tavolata Parete 2 + 3 + 4 (6 pax)', tables: ['2', '3', '4'], capacity: 6 },
  { id: 'combo-9-7-8', label: 'Blocco Sinistro 9 + 7 + 8 (6 pax)', tables: ['9', '7', '8'], capacity: 6 },
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
            <span style={{ width: '14px', height: '14px', background: '#362C24', border: '1px solid #1A1A1A' }}></span> Libero
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#FDB4BF', border: '2px solid #1A1A1A' }}></span> Selezionato
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#E5E7EB', border: '1px solid #D1D5DB' }}></span> Occupato
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#B5A642', fontWeight: 600 }}>
            ✦ Blocchi uniti: 7-8, 10-11, 12-13
          </span>
        </div>

        {/* Live Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          <span style={{ color: '#6B7280' }}>
            Tavoli scelti: <strong style={{ color: '#111111' }}>{selectedTables.join(', ') || 'Nessuno'}</strong> ({selectedPax} / {totalSeats} pax)
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
        viewBox="0 0 800 880" 
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
        <rect x="0" y="0" width="800" height="880" fill="#F8F6F2" />

        {/* Main Floor Polygon (Main room + Saletta + Corridoio) */}
        <polygon
          points="80,80 700,80 700,830 200,830 200,450 80,450"
          fill="#FFFFFF"
        />
        <polygon
          points="80,80 700,80 700,830 200,830 200,450 80,450"
          fill="url(#archGrid)"
        />

        {/* Saletta Tint (Centro-Sinistra sotto 7-8 e 5-6) */}
        <rect x="200" y="450" width="180" height="380" fill="#FCFAF7" opacity="0.8" />

        {/* Corridoio bagno + cucina area fill */}
        <rect x="380" y="450" width="320" height="380" fill="url(#kitchenHatch)" />

        {/* Structural Walls (Thick black architectural lines) */}
        {/* Left main wall (past 9, 7, 8 down to step) */}
        <line x1="80" y1="80" x2="80" y2="450" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Step inward between 7-8 and Saletta */}
        <line x1="80" y1="450" x2="200" y2="450" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="200" y1="450" x2="200" y2="830" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="200" y1="830" x2="700" y2="830" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="700" y1="830" x2="700" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Top Wall with Entrance Opening */}
        <line x1="80" y1="80" x2="320" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        <line x1="380" y1="80" x2="700" y2="80" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Dividing Wall: muro opposto alle finestre (dove sono appoggiati il 6 e il 4) */}
        {/* Horizontal dividing wall from Saletta wall to Right exterior wall */}
        <line x1="380" y1="450" x2="700" y2="450" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Vertical dividing wall between Saletta and Corridoio */}
        <line x1="380" y1="450" x2="380" y2="570" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />
        
        {/* Door swing arc for corridor */}
        <path d="M 380 570 A 70 70 0 0 1 450 640" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="380" y1="570" x2="450" y2="570" stroke="#6B7280" strokeWidth="1.5" />
        
        <line x1="380" y1="640" x2="380" y2="830" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="square" />

        {/* Saletta Zone Label */}
        <g style={{ userSelect: 'none', pointerEvents: 'none' }}>
          <text x="290" y="475" fill="#8F822E" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
            SALETTA
          </text>
        </g>

        {/* Corridoio bagno + cucina labels */}
        <g style={{ userSelect: 'none', pointerEvents: 'none' }}>
          <text x="540" y="605" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
            corridoio bagno
          </text>
          <text x="540" y="635" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
            + cucina
          </text>
          <rect x="480" y="660" width="120" height="24" fill="#EFECE6" stroke="#D1D5DB" />
          <text x="540" y="676" fill="#6B7280" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">
            ZONA RISERVATA
          </text>
        </g>

        {/* Top Header Labels & Window Glass Highlights */}
        {/* Vetrate (Left, sopra il tavolo 9) */}
        <text x="137" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        <rect x="90" y="62" width="110" height="4" fill="#C5A85A" />
        <line x1="90" y1="80" x2="200" y2="80" stroke="#C5A85A" strokeWidth="6" />
        <line x1="90" y1="76" x2="200" y2="76" stroke="#E8DFB8" strokeWidth="2" />

        {/* Entrata (Center) */}
        <text x="350" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Entrata
        </text>
        <polygon points="350,72 343,58 357,58" fill="#1A1A1A" />
        <line x1="320" y1="80" x2="380" y2="80" stroke="#B5A642" strokeWidth="2" strokeDasharray="4 3" />

        {/* Vetrate (Right, sopra il tavolo 2) */}
        <text x="645" y="46" fill="#1A1A1A" fontSize="19" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Vetrate
        </text>
        <rect x="585" y="62" width="110" height="4" fill="#C5A85A" />
        <line x1="585" y1="80" x2="695" y2="80" stroke="#C5A85A" strokeWidth="6" />
        <line x1="585" y1="76" x2="695" y2="76" stroke="#E8DFB8" strokeWidth="2" />

        {/* Modular Pair Connectors (7-8, 10-11, 12-13) */}
        {/* Connector 7 & 8: sempre attaccati */}
        <rect 
          x="101" 
          y="241" 
          width="72" 
          height="124" 
          fill="none" 
          stroke="#B5A642" 
          strokeWidth="1.5" 
          strokeDasharray="4 3" 
          opacity="0.8" 
        />
        
        {/* Connector 10 & 11: quasi sempre attaccati */}
        <rect 
          x="196" 
          y="121" 
          width="124" 
          height="68" 
          fill="none" 
          stroke="#B5A642" 
          strokeWidth="1.5" 
          strokeDasharray="4 3" 
          opacity="0.8" 
        />

        {/* Connector 12 & 13: modulari saletta */}
        <rect 
          x="241" 
          y="716" 
          width="124" 
          height="68" 
          fill="none" 
          stroke="#B5A642" 
          strokeWidth="1.5" 
          strokeDasharray="4 3" 
          opacity="0.8" 
        />

        {/* Tables & Architectural Chairs */}
        {TABLES.map((t) => {
          const selected = isSelected(t.id);
          const occupied = isOccupied(t.id);

          const tableFill = occupied ? '#E5E7EB' : selected ? '#FDB4BF' : '#362C24';
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
              {t.chairs === 'vertical' && (
                <>
                  <rect
                    x={t.x + (t.w - 32) / 2}
                    y={t.y - 7}
                    width={32}
                    height={5}
                    fill={chairFill}
                  />
                  <rect
                    x={t.x + (t.w - 32) / 2}
                    y={t.y + t.h + 2}
                    width={32}
                    height={5}
                    fill={chairFill}
                  />
                </>
              )}

              {t.chairs === 'horizontal' && (
                <>
                  <rect
                    x={t.x - 7}
                    y={t.y + (t.h - 30) / 2}
                    width={5}
                    height={30}
                    fill={chairFill}
                  />
                  <rect
                    x={t.x + t.w + 2}
                    y={t.y + (t.h - 30) / 2}
                    width={5}
                    height={30}
                    fill={chairFill}
                  />
                </>
              )}

              {t.chairs === 'top-sides' && (
                <>
                  <rect
                    x={t.x + (t.w - 32) / 2}
                    y={t.y - 7}
                    width={32}
                    height={5}
                    fill={chairFill}
                  />
                  <rect
                    x={t.x - 7}
                    y={t.y + (t.h - 26) / 2}
                    width={5}
                    height={26}
                    fill={chairFill}
                  />
                  <rect
                    x={t.x + t.w + 2}
                    y={t.y + (t.h - 26) / 2}
                    width={5}
                    height={26}
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

              {/* Table Number ONLY (no 'T' prefix) */}
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
