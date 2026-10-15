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
  const [viewZone, setViewZone] = useState('main'); // 'main' | 'all' | 'saletta'

  const isSelected = (id) => selectedTables.includes(id);
  const isOccupied = (id) => occupiedTables.includes(id);

  const totalSeats = TABLES.length * 2;
  const selectedPax = selectedTables.reduce((acc, tid) => {
    const t = TABLES.find(item => item.id === tid);
    return acc + (t ? t.pax : 2);
  }, 0);

  // Exact 2x pixel coordinates measured directly from media_1792059477198_315b740a.png (room: x=48..728, y=46..482)
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

    // Saletta Privata (Sotto Centro-Sinistra)
    '14': { x: 204, y: 540, w: 60, h: 60 },
    '12': { x: 204, y: 640, w: 60, h: 60 },
    '13': { x: 284, y: 640, w: 60, h: 60 }
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
        viewBox={viewZone === 'main' ? "24 24 736 476" : viewZone === 'saletta' ? "160 490 230 240" : "24 24 736 710"} 
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

        {/* Outer Hall Boundary (exact 2x coordinates of media_1792059477198_315b740a.png: x=48..728, y=46..482) */}
        {viewZone !== 'saletta' && (
          <g>
            <rect x="48" y="46" width="680" height="436" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.2" rx="4" />

            {/* Top Windows Section (FINESTRE SU VINDEGADE) */}
            <line x1="54" y1="57" x2="200" y2="57" stroke="#A39234" strokeWidth="3.5" />
            <line x1="208" y1="57" x2="564" y2="57" stroke="#A39234" strokeWidth="3.5" strokeDasharray="8 6" />
            <line x1="572" y1="57" x2="708" y2="57" stroke="#A39234" strokeWidth="3.5" />
            
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

            {/* Right wall arrow indicator (exact 2x position x=745, y=312) */}
            <g transform="translate(745, 312)">
              <line x1="0" y1="4" x2="0" y2="-4" stroke="#B5A642" strokeWidth="1.8" />
              <polyline points="-3,-1 0,-4 3,-1" fill="none" stroke="#B5A642" strokeWidth="1.8" />
            </g>
          </g>
        )}

        {/* Saletta Extension (shown in 'all' or 'saletta' mode) */}
        {viewZone !== 'main' && (
          <g>
            <rect x="174" y="482" width="200" height="236" fill="#FAF8F5" stroke="#D1D5DB" strokeWidth="1.2" rx="4" />
            <rect x="48" y="482" width="126" height="236" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
            <text x="111" y="605" fill="#9CA3AF" fontSize="12" fontWeight="600" textAnchor="middle">
              Ingresso
            </text>

            <rect x="374" y="482" width="354" height="236" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />
            <text x="551" y="595" fill="#9CA3AF" fontSize="13" fontWeight="600" textAnchor="middle">
              Cucina & Servizi
            </text>
            <text x="551" y="618" fill="#9CA3AF" fontSize="11" textAnchor="middle">
              Corridoio Bagni
            </text>

            <text 
              x="274" 
              y="512" 
              fill="#8F822E" 
              fontSize="11" 
              fontWeight="700" 
              textAnchor="middle" 
              letterSpacing="0.1em"
            >
              SALETTA PRIVATA
            </text>
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
