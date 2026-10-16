import React, { useState, useEffect } from 'react';

// Default table configurations with clean numbers (NO "T" prefix)
export const DEFAULT_TABLES = {
  // Sala Principale - 7 columns x 5 rows
  '9':  { id: '9',  label: '9',  name: 'Tavolo 9',  pax: 2, zone: 'Vindegade', room: 'main', row: 0, col: 0, chairs: ['top', 'bottom'] },
  '10': { id: '10', label: '10', name: 'Tavolo 10', pax: 2, zone: 'Vindegade', room: 'main', row: 0, col: 2, chairs: ['top', 'bottom'] },
  '11': { id: '11', label: '11', name: 'Tavolo 11', pax: 2, zone: 'Vindegade', room: 'main', row: 0, col: 3, chairs: ['top', 'bottom'] },
  '2':  { id: '2',  label: '2',  name: 'Tavolo 2',  pax: 2, zone: 'Vindegade', room: 'main', row: 0, col: 6, chairs: ['left', 'right'] },

  '7':  { id: '7',  label: '7',  name: 'Tavolo 7',  pax: 2, zone: 'Centro',    room: 'main', row: 2, col: 0, chairs: ['left', 'right'] },
  '5':  { id: '5',  label: '5',  name: 'Tavolo 5',  pax: 2, zone: 'Centro',    room: 'main', row: 2, col: 4, chairs: ['left', 'right'] },
  '3':  { id: '3',  label: '3',  name: 'Tavolo 3',  pax: 2, zone: 'Centro',    room: 'main', row: 2, col: 6, chairs: ['top', 'bottom'] },

  '8':  { id: '8',  label: '8',  name: 'Tavolo 8',  pax: 2, zone: 'Fondo',     room: 'main', row: 4, col: 0, chairs: ['left', 'right'] },
  '6':  { id: '6',  label: '6',  name: 'Tavolo 6',  pax: 2, zone: 'Fondo',     room: 'main', row: 4, col: 4, chairs: ['left', 'right'] },
  '4':  { id: '4',  label: '4',  name: 'Tavolo 4',  pax: 2, zone: 'Fondo',     room: 'main', row: 4, col: 6, chairs: ['left', 'right'] },

  // Saletta Privata Grid - 3 columns x 2 rows
  // Table 14 is at row 0, col 0 (ABOVE 12)
  // Table 12 is at row 1, col 0 (DIRECTLY BELOW 14)
  // Table 13 is at row 1, col 1 (NEXT TO 12)
  '14': { id: '14', label: '14', name: 'Tavolo 14', pax: 2, zone: 'Saletta', room: 'saletta', row: 0, col: 0, chairs: ['top', 'bottom'] },
  '12': { id: '12', label: '12', name: 'Tavolo 12', pax: 2, zone: 'Saletta', room: 'saletta', row: 1, col: 0, chairs: ['top', 'bottom'] },
  '13': { id: '13', label: '13', name: 'Tavolo 13', pax: 2, zone: 'Saletta', room: 'saletta', row: 1, col: 1, chairs: ['top', 'bottom'] }
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
  guests = 0,
  occupiedTables = [],
  onConfigChange,
  tableAssignments = {}, // { [tableId]: { customer_name, guests_count, booking_time, status } }
  activeAssigningRes = null,
  onConfirmAssignment = null,
  isSalettaMerged: isSalettaMergedProp = null,
  onToggleSalettaMerge: onToggleSalettaMergeProp = null
}) {
  const [tableData, setTableData] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_grid_tables_v4');
      if (saved) {
        return { ...DEFAULT_TABLES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read table data from storage', e);
    }
    return DEFAULT_TABLES;
  });

  const [internalSalettaMerged, setInternalSalettaMerged] = useState(() => {
    try {
      return localStorage.getItem('pupi_saletta_merged') === 'true';
    } catch {
      return false;
    }
  });

  const isSalettaMerged = isSalettaMergedProp !== null ? isSalettaMergedProp : internalSalettaMerged;

  const [activeTableId, setActiveTableId] = useState(null);
  const [draggedTableId, setDraggedTableId] = useState(null);

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(tableData);
    }
    try {
      localStorage.setItem('pupi_grid_tables_v4', JSON.stringify(tableData));
    } catch {}
  }, [tableData, onConfigChange]);

  const toggleSalettaMerge = () => {
    const nextState = !isSalettaMerged;
    if (onToggleSalettaMergeProp) {
      onToggleSalettaMergeProp(nextState);
    } else {
      setInternalSalettaMerged(nextState);
    }
    try {
      localStorage.setItem('pupi_saletta_merged', nextState ? 'true' : 'false');
    } catch {}

    if (nextState) {
      // Auto-select saletta tables
      if (onToggleTable) {
        if (!selectedTables.includes('14')) onToggleTable('14');
        if (!selectedTables.includes('13')) onToggleTable('13');
        if (!selectedTables.includes('12')) onToggleTable('12');
      }
    }
  };

  // Move table to target cell within specified room
  const moveTableToCell = (tableId, targetRow, targetCol, targetRoom = 'main') => {
    const existingTableInCell = Object.values(tableData).find(
      (t) => t.id !== tableId && (t.room || 'main') === targetRoom && t.row === targetRow && t.col === targetCol
    );

    const currentTable = tableData[tableId];

    if (existingTableInCell) {
      // Swap positions
      setTableData((prev) => ({
        ...prev,
        [tableId]: { ...prev[tableId], row: targetRow, col: targetCol, room: targetRoom },
        [existingTableInCell.id]: {
          ...prev[existingTableInCell.id],
          row: currentTable.row,
          col: currentTable.col,
          room: currentTable.room || 'main'
        }
      }));
    } else {
      setTableData((prev) => ({
        ...prev,
        [tableId]: { ...prev[tableId], row: targetRow, col: targetCol, room: targetRoom }
      }));
    }
    setActiveTableId(null);
  };

  const resetToDefaultLayout = () => {
    setTableData(DEFAULT_TABLES);
    if (onToggleSalettaMergeProp) {
      onToggleSalettaMergeProp(false);
    } else {
      setInternalSalettaMerged(false);
    }
    try {
      localStorage.setItem('pupi_saletta_merged', 'false');
      localStorage.removeItem('pupi_grid_tables_v4');
    } catch {}
    setActiveTableId(null);
  };

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

  // Dimensions
  const MAIN_COLS = 7;
  const MAIN_ROWS = 5;

  const SALETTA_COLS = 3;
  const SALETTA_ROWS = 2;

  // Occupancy maps
  const mainOccupancy = {};
  const salettaOccupancy = {};

  Object.values(tableData).forEach((t) => {
    if (t.room === 'saletta') {
      salettaOccupancy[`${t.row}_${t.col}`] = t;
    } else {
      mainOccupancy[`${t.row}_${t.col}`] = t;
    }
  });

  const activeTable = activeTableId ? tableData[activeTableId] : null;

  // Check if Saletta has an assigned reservation
  const salettaBooking =
    tableAssignments['14'] || tableAssignments['13'] || tableAssignments['12'] || null;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '0px', padding: '20px' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700, color: '#333333' }}>
            Planimetria Sala & Saletta a Griglia
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
            Griglia a quadratini per Sala e Saletta. Sposta i tavoli trascinandoli o cliccando sui quadratini liberi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

      {/* Active Table Quick Controller */}
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
            Tavolo {activeTable.label} selezionato ({activeTable.room === 'saletta' ? 'Saletta' : 'Sala'}):
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
              style={{ padding: '4px 8px', border: '1px solid #D1D5DB', background: '#FFFFFF', borderRadius: '0px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              ↕ Alto/Basso
            </button>
            <button
              type="button"
              onClick={() => setChairOrientation(activeTable.id, 'horizontal')}
              style={{ padding: '4px 8px', border: '1px solid #D1D5DB', background: '#FFFFFF', borderRadius: '0px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              ↔ Sinistra/Destra
            </button>
            <button
              type="button"
              onClick={() => setChairOrientation(activeTable.id, 'all')}
              style={{ padding: '4px 8px', border: '1px solid #D1D5DB', background: '#FFFFFF', borderRadius: '0px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
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
            style={{ padding: '4px 8px', border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#666' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Scroll Hint */}
      <div className="mobile-scroll-hint">
        <span>↔ Scorri la piantina orizzontalmente per esplorare tutti i tavoli</span>
      </div>

      {/* Responsive Floor Plan Outer & Inner Viewport */}
      <div className="floorplan-scroll-outer">
        <div className="floorplan-scroll-inner">
          {/* Architectural Top Marker: FINESTRE SU VINDEGADE */}
          <div style={{ maxWidth: '800px', margin: '0 auto 8px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ height: '3px', background: 'var(--color-accent-gold)', width: '60px' }}></div>
          <div style={{ flex: 1, height: '0px', borderTop: '2px dashed var(--color-accent-gold)', opacity: 0.8 }}></div>
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
        maxWidth: '800px',
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
            const table = mainOccupancy[cellKey];
            const isSelected = table && selectedTables.includes(table.id);
            const isOccupied = table && occupiedTables.includes(table.id);
            const assignment = table ? tableAssignments[table.id] : null;
            const isActiveForMove = activeTableId && !table;

            return (
              <div
                key={cellKey}
                onClick={() => {
                  if (activeAssigningRes) {
                    if (table && onToggleTable) {
                      onToggleTable(table.id);
                    }
                    return;
                  }
                  if (activeTableId && !table) {
                    moveTableToCell(activeTableId, r, c, 'main');
                  } else if (table) {
                    if (onToggleTable) onToggleTable(table.id);
                    setActiveTableId(table.id);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (activeAssigningRes) return;
                  e.preventDefault();
                  if (draggedTableId) {
                    moveTableToCell(draggedTableId, r, c, 'main');
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
                  cursor: activeAssigningRes && table ? 'pointer' : isActiveForMove ? 'pointer' : table ? 'grab' : 'default',
                  transition: 'background 0.15s ease'
                }}
                title={isActiveForMove ? `Sposta tavolo qui (riga ${r + 1}, col ${c + 1})` : undefined}
              >
                {isActiveForMove && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    border: '1.5px dashed #B5A642',
                    borderRadius: '50%'
                  }}></div>
                )}

                {table && renderTableBox({
                  table,
                  isSelected,
                  isOccupied,
                  assignment,
                  activeTableId,
                  setDraggedTableId,
                  setActiveTableId,
                  activeAssigningRes
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Corridor / Divider Label */}
      <div style={{
        maxWidth: '800px',
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
        <span style={{ color: 'var(--color-accent-gold)' }}>↓ Saletta Privata (Griglia a Quadratini)</span>
        <span>Cucina & Servizi</span>
      </div>

      {/* SALETTA PRIVATA SECTION WITH REAL GRID */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0px',
        boxSizing: 'border-box'
      }}>
        {/* Left spacer: WC corridor (cols 0..1) */}
        <div style={{
          gridColumn: 'span 2',
          minHeight: '190px',
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

        {/* Saletta Privata Grid Container (Cols 2..4) */}
        <div style={{
          gridColumn: 'span 3',
          border: '1.5px solid ' + (isSalettaMerged ? '#B5A642' : '#D1D5DB'),
          background: isSalettaMerged ? '#FFF5F6' : '#FAF6F4',
          position: 'relative',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '4px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#333333', textTransform: 'uppercase' }}>
              Saletta Privata
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-accent-gold)', fontWeight: 700 }}>
              {isSalettaMerged ? 'Tavolata Unita 7 pax' : 'Griglia Quadratini (14 sopra il 12)'}
            </span>
          </div>

          {/* IF SALETTA MERGED: 7 PAX BANQUET (3 left, 3 right, 1 capotavola) */}
          {isSalettaMerged ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '12px 0'
            }}>
              {(() => {
                const isSalettaSelected = ['14', '13', '12'].every((id) => selectedTables.includes(id));
                const isSalettaOccupied = !!salettaBooking || ['14', '13', '12'].some((id) => occupiedTables.includes(id));
                const isSalettaAvailableForRes = activeAssigningRes && !isSalettaOccupied;

                return (
                  <div
                    onClick={() => {
                      if (activeAssigningRes) {
                        if (isSalettaOccupied) {
                          alert('La Saletta Privata è già occupata per questa data!');
                          return;
                        }
                        if (isSalettaSelected) {
                          ['14', '13', '12'].forEach((id) => {
                            if (onToggleTable) onToggleTable(id);
                          });
                        } else {
                          // Select all 3 saletta tables
                          ['14', '13', '12'].forEach((id) => {
                            if (!selectedTables.includes(id) && onToggleTable) {
                              onToggleTable(id);
                            }
                          });
                        }
                        return;
                      }
                      ['14', '13', '12'].forEach((id) => {
                        if (onToggleTable) onToggleTable(id);
                      });
                    }}
                    className={isSalettaAvailableForRes && !isSalettaSelected ? 'table-box-available' : ''}
                    style={{
                      width: '140px',
                      minHeight: '135px',
                      background: isSalettaSelected
                        ? '#ECFDF5'
                        : salettaBooking
                        ? '#FFFDF5'
                        : '#FFFFFF',
                      border: isSalettaSelected
                        ? '3px solid #059669'
                        : isSalettaAvailableForRes
                        ? '2.5px solid #10B981'
                        : salettaBooking
                        ? '2px solid #B5A642'
                        : '2px solid #333333',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 10px',
                      cursor: activeAssigningRes ? (isSalettaOccupied ? 'not-allowed' : 'pointer') : 'pointer',
                      opacity: activeAssigningRes && isSalettaOccupied ? 0.6 : 1,
                      boxShadow: isSalettaSelected
                        ? '0 4px 14px rgba(5, 150, 105, 0.3)'
                        : isSalettaAvailableForRes
                        ? '0 0 12px rgba(16, 185, 129, 0.4)'
                        : '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* 1 Capotavola Top */}
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '11px',
                      height: '11px',
                      background: isSalettaSelected ? '#059669' : '#B5A642',
                      borderRadius: '50%',
                      border: '1.5px solid #333'
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
                          background: isSalettaSelected ? '#059669' : '#B5A642',
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
                          background: isSalettaSelected ? '#059669' : '#B5A642',
                          borderRadius: '50%',
                          border: '1px solid #333'
                        }}
                        title={`Lato Destro Posto ${i + 1}`}
                      ></div>
                    ))}

                    {/* Table Inner Content */}
                    <div style={{ fontSize: '11px', fontWeight: 800, color: isSalettaSelected ? '#059669' : 'var(--color-neutral-muted)', marginBottom: '2px' }}>
                      14 + 13 + 12
                    </div>

                    {isSalettaSelected ? (
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669', lineHeight: 1.2 }}>
                          ✓ SELEZIONATA
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                          {activeAssigningRes ? activeAssigningRes.customer_name : '7 pax'}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#059669',
                          background: '#DCFCE7',
                          padding: '2px 6px',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          Pronta per Assegnazione
                        </div>
                      </div>
                    ) : salettaBooking ? (
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#1C1917', lineHeight: 1.2 }}>
                          🔒 {salettaBooking.customer_name}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#B5A642', marginTop: '2px' }}>
                          {salettaBooking.guests_count || 7} pax · {salettaBooking.booking_time}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: salettaBooking.status === 'seated' ? '#059669' : '#1C1917',
                          background: salettaBooking.status === 'seated' ? '#ECFDF5' : '#FFF5F6',
                          padding: '2px 6px',
                          border: '1px solid #FDB4BF',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          {salettaBooking.status === 'seated' ? '✓ Al Tavolo (Siede)' : 'Accettata'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#333333' }}>
                          Tavolata Saletta
                        </div>
                        {isSalettaAvailableForRes ? (
                          <div style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#059669',
                            background: '#DCFCE7',
                            padding: '2px 6px',
                            marginTop: '4px',
                            display: 'inline-block'
                          }}>
                            + TOCCA PER SCEGLIERE (7p)
                          </div>
                        ) : (
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#B5A642',
                            background: '#FFF5F6',
                            padding: '2px 6px',
                            border: '1px solid #FDB4BF',
                            marginTop: '4px',
                            display: 'inline-block'
                          }}>
                            7 pax
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* SALETTA GRID OF QUADRATINI (3 Cols x 2 Rows: 14 is Row 0 Col 0, 12 is Row 1 Col 0, 13 is Row 1 Col 1) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${SALETTA_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${SALETTA_ROWS}, 86px)`,
              gap: '0px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              boxSizing: 'border-box'
            }}>
              {Array.from({ length: SALETTA_ROWS }).map((_, r) =>
                Array.from({ length: SALETTA_COLS }).map((_, c) => {
                  const cellKey = `${r}_${c}`;
                  const table = salettaOccupancy[cellKey];
                  const isSelected = table && selectedTables.includes(table.id);
                  const isOccupied = table && occupiedTables.includes(table.id);
                  const assignment = table ? tableAssignments[table.id] : null;
                  const isActiveForMove = activeTableId && !table;

                  return (
                    <div
                      key={cellKey}
                      onClick={() => {
                        if (activeAssigningRes) {
                          if (table && onToggleTable) {
                            onToggleTable(table.id);
                          }
                          return;
                        }
                        if (activeTableId && !table) {
                          moveTableToCell(activeTableId, r, c, 'saletta');
                        } else if (table) {
                          if (onToggleTable) onToggleTable(table.id);
                          setActiveTableId(table.id);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedTableId) {
                          moveTableToCell(draggedTableId, r, c, 'saletta');
                          setDraggedTableId(null);
                        }
                      }}
                      style={{
                        position: 'relative',
                        borderRight: c < SALETTA_COLS - 1 ? '1px solid #E5E7EB' : 'none',
                        borderBottom: r < SALETTA_ROWS - 1 ? '1px solid #E5E7EB' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActiveForMove
                          ? 'rgba(253, 180, 191, 0.12)'
                          : table
                          ? '#FFFFFF'
                          : '#FAFAFA',
                        cursor: activeAssigningRes && table ? 'pointer' : isActiveForMove ? 'pointer' : table ? 'grab' : 'default',
                        transition: 'background 0.15s ease'
                      }}
                      title={isActiveForMove ? `Sposta tavolo qui in Saletta (riga ${r + 1}, col ${c + 1})` : undefined}
                    >
                      {isActiveForMove && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          border: '1.5px dashed #B5A642',
                          borderRadius: '50%'
                        }}></div>
                      )}

                      {table && renderTableBox({
                        table,
                        isSelected,
                        isOccupied,
                        assignment,
                        activeTableId,
                        setDraggedTableId,
                        setActiveTableId,
                        activeAssigningRes
                      })}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right spacer: Kitchen & Bar (cols 5..6) */}
        <div style={{
          gridColumn: 'span 2',
          minHeight: '190px',
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
        maxWidth: '800px',
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
          <span style={{ width: '12px', height: '12px', background: '#DCFCE7', border: '1.5px solid #10B981' }}></span>
          Disponibile (+ Tocca)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#ECFDF5', border: '2px solid #059669' }}></span>
          Selezionato (Scelto)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FFFDF5', border: '1.5px solid #B5A642' }}></span>
          Occupato (🔒 Altro Cliente)
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Table Box Renderer showing customer name when assigned
function renderTableBox({
  table,
  isSelected,
  isOccupied,
  assignment,
  activeTableId,
  setDraggedTableId,
  setActiveTableId,
  activeAssigningRes
}) {
  const isSeated = assignment && assignment.status === 'seated';
  const isAssignedToOther = assignment && (!activeAssigningRes || assignment.id !== activeAssigningRes.id);
  const isAvailableForRes = activeAssigningRes && !isAssignedToOther && !isOccupied && !isSelected;
  const canDrag = !activeAssigningRes;

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        setDraggedTableId(table.id);
        setActiveTableId(table.id);
        e.dataTransfer.setData('text/plain', table.id);
      }}
      className={isAvailableForRes ? 'table-box-available' : ''}
      style={{
        width: '66px',
        height: '66px',
        position: 'relative',
        background: isSelected
          ? '#ECFDF5'
          : isSeated
          ? '#F0FDF4'
          : isAssignedToOther
          ? '#FFFDF5'
          : '#FFFFFF',
        border: isSelected
          ? '2.5px solid #059669'
          : isAvailableForRes
          ? '2px solid #10B981'
          : activeTableId === table.id
          ? '2px solid #B5A642'
          : isSeated
          ? '2px solid #059669'
          : assignment
          ? '1.8px solid #B5A642'
          : '1.2px solid #D1D5DB',
        borderRadius: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        boxShadow: isSelected
          ? '0 3px 8px rgba(5, 150, 105, 0.25)'
          : isAvailableForRes
          ? '0 0 10px rgba(16, 185, 129, 0.35)'
          : 'none',
        cursor: activeAssigningRes
          ? (isAssignedToOther ? 'not-allowed' : 'pointer')
          : 'grab',
        opacity: activeAssigningRes && isAssignedToOther ? 0.55 : 1,
        transition: 'all 0.15s ease'
      }}
    >
      {/* Chairs around table */}
      {renderChairs(table.chairs || ['top', 'bottom'], isSelected || isAvailableForRes || !!assignment)}

      {/* When table is selected for current reservation */}
      {isSelected ? (
        <div style={{ textAlign: 'center', width: '100%', padding: '0 2px' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
            ✓ {table.label}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: 800,
            color: '#065F46',
            background: '#A7F3D0',
            padding: '1px 3px',
            marginTop: '3px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            SCELTO
          </div>
        </div>
      ) : isAssignedToOther ? (
        <div style={{ textAlign: 'center', width: '100%', padding: '0 2px', overflow: 'hidden' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, color: '#1C1917', lineHeight: 1 }}>
            🔒 {table.label}
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: isSeated ? '#059669' : '#B5A642',
              marginTop: '2px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '60px'
            }}
            title={assignment.customer_name}
          >
            {assignment.customer_name}
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '1px' }}>
            {assignment.guests_count || table.pax}p · {assignment.booking_time}
          </div>
        </div>
      ) : isAvailableForRes ? (
        <>
          <div style={{
            fontSize: '16px',
            fontWeight: 900,
            color: '#111827',
            lineHeight: 1
          }}>
            {table.label}
          </div>
          <div style={{
            fontSize: '9px',
            fontWeight: 800,
            color: '#059669',
            background: '#DCFCE7',
            padding: '1px 4px',
            marginTop: '3px'
          }}>
            + TOCCA ({table.pax}p)
          </div>
        </>
      ) : assignment ? (
        <div style={{ textAlign: 'center', width: '100%', padding: '0 2px', overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#1C1917', lineHeight: 1 }}>
            {table.label}
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: isSeated ? '#059669' : '#B5A642',
              marginTop: '2px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '60px'
            }}
            title={assignment.customer_name}
          >
            {assignment.customer_name}
          </div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '1px' }}>
            {assignment.guests_count || table.pax}p · {assignment.booking_time}
          </div>
        </div>
      ) : (
        <>
          <div style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#333333',
            lineHeight: 1
          }}>
            {table.label}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--color-neutral-muted)',
            marginTop: '3px',
            fontWeight: 600
          }}>
            {table.pax} pax
          </div>
        </>
      )}
    </div>
  );
}

// Chair dots helper
function renderChairs(activeSides = ['top', 'bottom'], isHighlighted = false) {
  const dotColor = isHighlighted ? '#B5A642' : '#9CA3AF';
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
