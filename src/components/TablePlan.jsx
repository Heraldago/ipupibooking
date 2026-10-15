import React, { useState, useEffect } from 'react';

// Default table configurations with clean numbers (NO "T" prefix as requested)
export const DEFAULT_TABLES = {
  // Sala Principale - Top Row (Finestre su Vindegade)
  '9':  { id: '9',  label: '9',  name: 'Tavolo 9',  pax: 2, zone: 'Vindegade', row: 0, col: 0, chairs: ['top', 'bottom'] },
  '10': { id: '10', label: '10', name: 'Tavolo 10', pax: 2, zone: 'Vindegade', row: 0, col: 2, chairs: ['top', 'bottom'] },
  '11': { id: '11', label: '11', name: 'Tavolo 11', pax: 2, zone: 'Vindegade', row: 0, col: 3, chairs: ['top', 'bottom'] },
  '2':  { id: '2',  label: '2',  name: 'Tavolo 2',  pax: 2, zone: 'Vindegade', row: 0, col: 6, chairs: ['left', 'right'] },

  // Sala Principale - Middle Row
  '7':  { id: '7',  label: '7',  name: 'Tavolo 7',  pax: 2, zone: 'Centro',    row: 2, col: 0, chairs: ['left', 'right'] },
  '5':  { id: '5',  label: '5',  name: 'Tavolo 5',  pax: 2, zone: 'Centro',    row: 2, col: 4, chairs: ['left', 'right'] },
  '3':  { id: '3',  label: '3',  name: 'Tavolo 3',  pax: 2, zone: 'Centro',    row: 2, col: 6, chairs: ['top', 'bottom'] },

  // Sala Principale - Bottom Row
  '8':  { id: '8',  label: '8',  name: 'Tavolo 8',  pax: 2, zone: 'Fondo',     row: 4, col: 0, chairs: ['left', 'right'] },
  '6':  { id: '6',  label: '6',  name: 'Tavolo 6',  pax: 2, zone: 'Fondo',     row: 4, col: 4, chairs: ['left', 'right'] },
  '4':  { id: '4',  label: '4',  name: 'Tavolo 4',  pax: 2, zone: 'Fondo',     row: 4, col: 6, chairs: ['left', 'right'] },

  // Saletta Privata
  '14': { id: '14', label: '14', name: 'Tavolo 14', pax: 2, zone: 'Saletta',   row: 5, col: 2, chairs: ['top', 'bottom'] },
  '12': { id: '12', label: '12', name: 'Tavolo 12', pax: 2, zone: 'Saletta',   row: 6, col: 1, chairs: ['top', 'bottom'] },
  '13': { id: '13', label: '13', name: 'Tavolo 13', pax: 2, zone: 'Saletta',   row: 6, col: 2, chairs: ['top', 'bottom'] }
};

export const TABLES = Object.values(DEFAULT_TABLES);

export const PRESET_COMBOS = [
  { id: 'saletta-7pax', label: 'Tavolata Saletta Unita (14+13+12 - 7 pax)', tables: ['14', '13', '12'], capacity: 7, isSalettaMerge: true },
  { id: 'combo-7-8', label: 'Parete Sinistra (7 + 8 - 4 pax)', tables: ['7', '8'], capacity: 4 },
  { id: 'combo-10-11', label: 'Vindegade (10 + 11 - 4 pax)', tables: ['10', '11'], capacity: 4 },
  { id: 'combo-5-6', label: 'Centro Sala (5 + 6 - 4 pax)', tables: ['5', '6'], capacity: 4 },
  { id: 'combo-3-4', label: 'Parete Destra (3 + 4 - 4 pax)', tables: ['3', '4'], capacity: 4 },
  { id: 'combo-2-3-4', label: 'Parete Destra (2 + 3 + 4 - 6 pax)', tables: ['2', '3', '4'], capacity: 6 }
];

export default function TablePlan({
  selectedTables = [],
  onToggleTable,
  guests,
  occupiedTables = [],
  onConfigChange
}) {
  // Load custom table positions and configurations from localStorage
  const [tableData, setTableData] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_grid_tables_v3');
      if (saved) {
        return { ...DEFAULT_TABLES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read table data from storage', e);
    }
    return DEFAULT_TABLES;
  });

  // Saletta banquet mode state (auto merges 14, 13, 12 in center vertical line with 7 pax)
  const [isSalettaMerged, setIsSalettaMerged] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_saletta_merged');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Selected table for moving or editing
  const [activeTableId, setActiveTableId] = useState(null);
  const [draggedTableId, setDraggedTableId] = useState(null);

  // Sync to parent when tableData changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(tableData);
    }
    try {
      localStorage.setItem('pupi_grid_tables_v3', JSON.stringify(tableData));
    } catch (e) {
      console.warn('Could not save table data', e);
    }
  }, [tableData, onConfigChange]);

  // Save saletta merge state
  useEffect(() => {
    try {
      localStorage.setItem('pupi_saletta_merged', isSalettaMerged ? 'true' : 'false');
    } catch {}
  }, [isSalettaMerged]);

  // Move a table to a specific cell (row, col)
  const moveTableToCell = (tableId, targetRow, targetCol) => {
    // Check if cell is occupied by another table
    const existingTableInCell = Object.values(tableData).find(
      (t) => t.id !== tableId && t.row === targetRow && t.col === targetCol
    );

    if (existingTableInCell) {
      // Swap positions
      const currentTable = tableData[tableId];
      setTableData((prev) => ({
        ...prev,
        [tableId]: { ...prev[tableId], row: targetRow, col: targetCol },
        [existingTableInCell.id]: { ...prev[existingTableInCell.id], row: currentTable.row, col: currentTable.col }
      }));
    } else {
      setTableData((prev) => ({
        ...prev,
        [tableId]: { ...prev[tableId], row: targetRow, col: targetCol }
      }));
    }
    setActiveTableId(null);
  };

  // Toggle Saletta Banquet Mode (14, 13, 12 united in vertical center line)
  const toggleSalettaMerge = () => {
    const nextState = !isSalettaMerged;
    setIsSalettaMerged(nextState);

    if (nextState) {
      // Automatically place 14, 13, 12 down col 2 in rows 5, 6, 7
      setTableData((prev) => ({
        ...prev,
        '14': { ...prev['14'], row: 5, col: 2, pax: 2 },
        '13': { ...prev['13'], row: 6, col: 2, pax: 2 },
        '12': { ...prev['12'], row: 7, col: 2, pax: 3 } // total 7 pax
      }));
      // Auto-select saletta tables
      if (onToggleTable) {
        if (!selectedTables.includes('14')) onToggleTable('14');
        if (!selectedTables.includes('13')) onToggleTable('13');
        if (!selectedTables.includes('12')) onToggleTable('12');
      }
    } else {
      // Reset Saletta tables to default separate layout
      setTableData((prev) => ({
        ...prev,
        '14': { ...DEFAULT_TABLES['14'] },
        '13': { ...DEFAULT_TABLES['13'] },
        '12': { ...DEFAULT_TABLES['12'] }
      }));
    }
  };

  // Reset entire floor plan to default photo layout
  const resetToDefaultLayout = () => {
    setTableData(DEFAULT_TABLES);
    setIsSalettaMerged(false);
    setActiveTableId(null);
  };

  // Change chair orientation of active table
  const setChairOrientation = (tableId, orientation) => {
    let chairs = [];
    if (orientation === 'vertical') chairs = ['top', 'bottom'];
    else if (orientation === 'horizontal') chairs = ['left', 'right'];
    else if (orientation === 'all') chairs = ['top', 'bottom', 'left', 'right'];

    setTableData((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId], chairs }
    }));
  };

  // Change pax count of active table
  const updatePax = (tableId, delta) => {
    setTableData((prev) => {
      const currentPax = prev[tableId]?.pax || 2;
      const newPax = Math.max(1, Math.min(8, currentPax + delta));
      return {
        ...prev,
        [tableId]: { ...prev[tableId], pax: newPax }
      };
    });
  };

  // Grid dimensions
  // Main Room: 7 columns (0..6), 5 rows (0..4)
  // Transition / Saletta: rows 5, 6, 7
  const MAIN_COLS = 7;
  const MAIN_ROWS = 5;

  // Build grid occupancy map
  const cellOccupancy = {};
  Object.values(tableData).forEach((t) => {
    cellOccupancy[`${t.row}_${t.col}`] = t;
  });

  const activeTable = activeTableId ? tableData[activeTableId] : null;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '0px', padding: '20px' }}>
      {/* Header bar / Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700, color: '#333333' }}>
            Planimetria Interattiva a Griglia
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
            Clicca o trascina un tavolo nei quadratini vuoti per riordinare la sala come vuoi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Saletta Tavolata Toggle */}
          <button
            type="button"
            onClick={toggleSalettaMerge}
            style={{
              padding: '6px 14px',
              background: isSalettaMerged ? '#FDB4BF' : '#FFF5F6',
              border: '1.5px solid ' + (isSalettaMerged ? '#333333' : '#B5A642'),
              borderRadius: '0px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#333333',
              cursor: 'pointer'
            }}
          >
            {isSalettaMerged ? '✓ Saletta Tavolata Unita (7 pax)' : '✦ Unisci Saletta (14+13+12 - 7 pax)'}
          </button>

          {/* Reset Layout */}
          <button
            type="button"
            onClick={resetToDefaultLayout}
            style={{
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '0px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-neutral-muted)',
              cursor: 'pointer'
            }}
          >
            Ripristina Posizioni
          </button>
        </div>
      </div>

      {/* Active Table Quick Controller when a table is clicked */}
      {activeTable && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#FFF5F6',
          border: '1.5px solid #FDB4BF',
          padding: '10px 16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          borderRadius: '0px'
        }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#333333' }}>
            Tavolo {activeTable.label} selezionato:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-neutral-muted)' }}>Capienza:</span>
            <button
              type="button"
              onClick={() => updatePax(activeTable.id, -1)}
              style={{ width: '26px', height: '26px', border: '1px solid #D1D5DB', background: '#FFF', cursor: 'pointer', fontWeight: 700, borderRadius: '0px' }}
            >
              -
            </button>
            <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{activeTable.pax}</span>
            <button
              type="button"
              onClick={() => updatePax(activeTable.id, 1)}
              style={{ width: '26px', height: '26px', border: '1px solid #D1D5DB', background: '#FFF', cursor: 'pointer', fontWeight: 700, borderRadius: '0px' }}
            >
              +
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-neutral-muted)' }}>Sedie:</span>
            <button
              type="button"
              onClick={() => setChairOrientation(activeTable.id, 'vertical')}
              style={{
                padding: '4px 8px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                borderRadius: '0px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ↕ Alto/Basso
            </button>
            <button
              type="button"
              onClick={() => setChairOrientation(activeTable.id, 'horizontal')}
              style={{
                padding: '4px 8px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                borderRadius: '0px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ↔ Sinistra/Destra
            </button>
            <button
              type="button"
              onClick={() => setChairOrientation(activeTable.id, 'all')}
              style={{
                padding: '4px 8px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                borderRadius: '0px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✛ 4 Lati
            </button>
          </div>

          <span style={{ fontSize: '12px', color: '#B5A642', marginLeft: 'auto', fontWeight: 600 }}>
            💡 Clicca su un quadratino vuoto per spostare il tavolo lì
          </span>

          <button
            type="button"
            onClick={() => setActiveTableId(null)}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Architectural Top Marker: FINESTRE SU VINDEGADE exactly as in user photo */}
      <div style={{ maxWidth: '780px', margin: '0 auto 8px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ height: '3px', background: 'var(--color-accent-gold)', width: '60px' }}></div>
          <div style={{
            flex: 1,
            height: '0px',
            borderTop: '2px dashed var(--color-accent-gold)',
            opacity: 0.8
          }}></div>
          <div style={{ height: '3px', background: 'var(--color-accent-gold)', width: '60px' }}></div>
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          letterSpacing: '1.5px',
          fontWeight: 700,
          color: 'var(--color-accent-gold)',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          Finestre su Vindegade
        </div>
      </div>

      {/* MAIN HALL GRID (7 Columns x 5 Rows) */}
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(5, 86px)',
        gap: '0px',
        border: '1.5px solid #D1D5DB',
        background: '#FAF6F4',
        boxSizing: 'border-box'
      }}>
        {Array.from({ length: MAIN_ROWS }).map((_, r) =>
          Array.from({ length: MAIN_COLS }).map((_, c) => {
            const cellKey = `${r}_${c}`;
            const table = cellOccupancy[cellKey];
            const isSelected = table && selectedTables.includes(table.id);
            const isOccupied = table && occupiedTables.includes(table.id);
            const isActiveForMove = activeTableId && !table;

            return (
              <div
                key={cellKey}
                onClick={() => {
                  if (activeTableId && !table) {
                    moveTableToCell(activeTableId, r, c);
                  } else if (table) {
                    if (onToggleTable) onToggleTable(table.id);
                    setActiveTableId(table.id);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTableId) {
                    moveTableToCell(draggedTableId, r, c);
                    setDraggedTableId(null);
                  }
                }}
                style={{
                  position: 'relative',
                  borderRight: c < MAIN_COLS - 1 ? '1px solid #E5E7EB' : 'none',
                  borderBottom: r < MAIN_ROWS - 1 ? '1px solid #E5E7EB' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActiveForMove
                    ? 'rgba(253, 180, 191, 0.12)'
                    : table
                    ? '#FFFFFF'
                    : 'transparent',
                  cursor: isActiveForMove ? 'pointer' : table ? 'grab' : 'default',
                  transition: 'background 0.15s ease'
                }}
                title={isActiveForMove ? `Sposta tavolo qui (riga ${r + 1}, col ${c + 1})` : undefined}
              >
                {/* Empty cell indicator dot when moving */}
                {isActiveForMove && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    border: '1.5px dashed #B5A642',
                    borderRadius: '50%'
                  }}></div>
                )}

                {/* Render Table in Cell */}
                {table && (
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDraggedTableId(table.id);
                      setActiveTableId(table.id);
                      e.dataTransfer.setData('text/plain', table.id);
                    }}
                    style={{
                      width: '64px',
                      height: '64px',
                      position: 'relative',
                      background: isSelected ? '#FFF5F6' : '#FFFFFF',
                      border: isSelected
                        ? '2px solid #333333'
                        : activeTableId === table.id
                        ? '2px solid #B5A642'
                        : '1.2px solid #D1D5DB',
                      borderRadius: '0px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Chair dots around table */}
                    {renderChairs(table.chairs || ['top', 'bottom'], isSelected)}

                    {/* Table Label (NO "T" prefix!) */}
                    <div style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: isSelected ? '#1C1917' : '#333333',
                      lineHeight: 1
                    }}>
                      {table.label}
                    </div>

                    {/* Pax */}
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--color-neutral-muted)',
                      marginTop: '3px',
                      fontWeight: 600
                    }}>
                      {table.pax} pax
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Corridor / Divider Label */}
      <div style={{
        maxWidth: '780px',
        margin: '12px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--color-neutral-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        <span>Corridoio Bagno</span>
        <span style={{ color: 'var(--color-accent-gold)' }}>↓ Accesso Saletta Privata</span>
        <span>Cucina & Servizi</span>
      </div>

      {/* SALETTA PRIVATA GRID SECTION */}
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0px',
        boxSizing: 'border-box'
      }}>
        {/* Left spacer: WC corridor (cols 0..1) */}
        <div style={{
          gridColumn: 'span 2',
          height: '210px',
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '12px',
          fontWeight: 600,
          borderRight: '2px solid #D1D5DB'
        }}>
          Corridoio Bagno
        </div>

        {/* Saletta Privata (Cols 2..4) */}
        <div style={{
          gridColumn: 'span 3',
          border: '1.5px solid ' + (isSalettaMerged ? '#B5A642' : '#D1D5DB'),
          background: isSalettaMerged ? '#FFF5F6' : '#FAF6F4',
          position: 'relative',
          padding: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '6px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#333333', textTransform: 'uppercase' }}>
              Saletta Privata
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-accent-gold)', fontWeight: 700 }}>
              {isSalettaMerged ? 'Tavolata Unita 7 pax' : '3 Tavoli Separati'}
            </span>
          </div>

          {/* IF SALETTA MERGED: RENDER THE UNIFIED BANQUET (7 PAX: 3 left, 3 right, 1 capotavola) */}
          {isSalettaMerged ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0'
            }}>
              {/* Banquet Table Box */}
              <div
                onClick={() => {
                  ['14', '13', '12'].forEach((id) => {
                    if (onToggleTable) onToggleTable(id);
                  });
                }}
                style={{
                  width: '90px',
                  height: '140px',
                  background: '#FFFFFF',
                  border: '2px solid #333333',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                {/* 1 Capotavola Top */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  background: '#B5A642',
                  borderRadius: '50%',
                  border: '1px solid #333'
                }} title="Capotavola (1 posto)"></div>

                {/* 3 Chairs Left */}
                {[0.2, 0.5, 0.8].map((fraction, i) => (
                  <div
                    key={'l-' + i}
                    style={{
                      position: 'absolute',
                      left: '-12px',
                      top: `${fraction * 100}%`,
                      transform: 'translateY(-50%)',
                      width: '10px',
                      height: '10px',
                      background: '#B5A642',
                      borderRadius: '50%',
                      border: '1px solid #333'
                    }}
                    title={`Lato Sinistro Posto ${i + 1}`}
                  ></div>
                ))}

                {/* 3 Chairs Right */}
                {[0.2, 0.5, 0.8].map((fraction, i) => (
                  <div
                    key={'r-' + i}
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      top: `${fraction * 100}%`,
                      transform: 'translateY(-50%)',
                      width: '10px',
                      height: '10px',
                      background: '#B5A642',
                      borderRadius: '50%',
                      border: '1px solid #333'
                    }}
                    title={`Lato Destro Posto ${i + 1}`}
                  ></div>
                ))}

                {/* Table Inner Content */}
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-neutral-muted)' }}>
                  14 + 13 + 12
                </div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#333333' }}>
                  Tavolata
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#B5A642',
                  background: '#FFF5F6',
                  padding: '2px 6px',
                  border: '1px solid #FDB4BF'
                }}>
                  7 pax
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SALETTA: Individual Tables 14, 12, 13 */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              padding: '6px'
            }}>
              {/* Table 14 (Upper center/left) */}
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
                {renderSingleTableCard(tableData['14'], selectedTables, occupiedTables, onToggleTable, setActiveTableId, activeTableId)}
              </div>
              {/* Tables 12 and 13 (Lower side by side) */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderSingleTableCard(tableData['12'], selectedTables, occupiedTables, onToggleTable, setActiveTableId, activeTableId)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderSingleTableCard(tableData['13'], selectedTables, occupiedTables, onToggleTable, setActiveTableId, activeTableId)}
              </div>
            </div>
          )}
        </div>

        {/* Right spacer: Kitchen & Bar (cols 5..6) */}
        <div style={{
          gridColumn: 'span 2',
          height: '210px',
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderLeft: '2px solid #D1D5DB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '12px',
          fontWeight: 600
        }}>
          <div>Cucina & Banco Bar</div>
          <small style={{ fontSize: '10px', color: '#BBB' }}>Area Riservata Staff</small>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        maxWidth: '780px',
        margin: '16px auto 0 auto',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: 'var(--color-neutral-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FFFFFF', border: '1.2px solid #D1D5DB' }}></span>
          Tavolo Libero
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FFF5F6', border: '2px solid #333333' }}></span>
          Selezionato
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: '#B5A642', borderRadius: '50%' }}></span>
          Seduta (Sedia)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', border: '1px dashed #B5A642' }}></span>
          Quadratino libero (spostamento)
        </div>
      </div>
    </div>
  );
}

// Helper to render circular chair dots around a square table
function renderChairs(activeSides = ['top', 'bottom'], isSelected = false) {
  const dotColor = isSelected ? '#333333' : '#9CA3AF';
  const size = 6;
  const offset = -7;

  return (
    <>
      {activeSides.includes('top') && (
        <>
          <div style={{ position: 'absolute', top: `${offset}px`, left: '30%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: `${offset}px`, left: '70%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
        </>
      )}
      {activeSides.includes('bottom') && (
        <>
          <div style={{ position: 'absolute', bottom: `${offset}px`, left: '30%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: `${offset}px`, left: '70%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
        </>
      )}
      {activeSides.includes('left') && (
        <>
          <div style={{ position: 'absolute', left: `${offset}px`, top: '30%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', left: `${offset}px`, top: '70%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
        </>
      )}
      {activeSides.includes('right') && (
        <>
          <div style={{ position: 'absolute', right: `${offset}px`, top: '30%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', right: `${offset}px`, top: '70%', width: `${size}px`, height: `${size}px`, background: dotColor, borderRadius: '50%' }}></div>
        </>
      )}
    </>
  );
}

// Helper for rendering standard cards in Saletta
function renderSingleTableCard(table, selectedTables, occupiedTables, onToggleTable, setActiveTableId, activeTableId) {
  if (!table) return null;
  const isSelected = selectedTables.includes(table.id);

  return (
    <div
      onClick={() => {
        if (onToggleTable) onToggleTable(table.id);
        setActiveTableId(table.id);
      }}
      style={{
        width: '64px',
        height: '64px',
        position: 'relative',
        background: isSelected ? '#FFF5F6' : '#FFFFFF',
        border: isSelected
          ? '2px solid #333333'
          : activeTableId === table.id
          ? '2px solid #B5A642'
          : '1.2px solid #D1D5DB',
        borderRadius: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {renderChairs(table.chairs || ['top', 'bottom'], isSelected)}
      <div style={{ fontSize: '17px', fontWeight: 800, color: isSelected ? '#1C1917' : '#333333' }}>
        {table.label}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--color-neutral-muted)', marginTop: '2px', fontWeight: 600 }}>
        {table.pax} pax
      </div>
    </div>
  );
}
