import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES, PRESET_COMBOS } from './TablePlan';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { adminTranslations } from '../i18n';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Clock, 
  Utensils, 
  RefreshCw, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminPage({ onNavigateToBooking }) {
  const [adminLang, setAdminLang] = useState('it');
  const t = adminTranslations[adminLang];

  const [staffSelectedTables, setStaffSelectedTables] = useState(['2', '3']);
  const [tableConfigs, setTableConfigs] = useState(null);
  const [reservations, setReservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pupi_reservations') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today'

  const todayStr = new Date().toISOString().split('T')[0];

  const loadReservations = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setReservations(data);
          localStorage.setItem('pupi_reservations', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('Could not load reservations from Supabase', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const toggleStaffTable = (id) => {
    if (staffSelectedTables.includes(id)) {
      setStaffSelectedTables(staffSelectedTables.filter((t) => t !== id));
    } else {
      setStaffSelectedTables([...staffSelectedTables, id]);
    }
  };

  const applyStaffCombo = (combo) => {
    setStaffSelectedTables(combo.tables);
  };

  const calculateStaffCapacity = () => {
    return staffSelectedTables.reduce((acc, tid) => {
      if (tableConfigs && tableConfigs[tid] && typeof tableConfigs[tid].pax === 'number') {
        return acc + tableConfigs[tid].pax;
      }
      const t = TABLES.find((item) => item.id === tid);
      return acc + (t ? t.pax : 2);
    }, 0);
  };

  // Assign a reservation to the Saletta (tables 14, 13, 12 merged at center)
  const assignToSaletta = (res) => {
    setStaffSelectedTables(['14', '13', '12']);
    try {
      localStorage.setItem('pupi_saletta_merged', 'true');
    } catch {}
    alert(`Prenotazione di ${res.customer_name} (${res.guests_count} persone) assegnata alla Saletta Privata (Tavolata 14+13+12 al centro).`);
  };

  const filteredReservations = reservations.filter((r) => {
    if (dateFilter === 'today') return r.booking_date === todayStr;
    return true;
  });

  const totalGuestsToday = reservations
    .filter((r) => r.booking_date === todayStr)
    .reduce((acc, r) => acc + (parseInt(r.guests_count) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F4', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Top bar: Navigation & Language */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '16px'
        }}>
          <button
            type="button"
            onClick={onNavigateToBooking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #1C1917',
              borderRadius: '0px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              color: '#1C1917'
            }}
          >
            <ArrowLeft size={16} />
            <span>← Vai al sito Prenotazioni Clienti</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setAdminLang('it')}
              className={adminLang === 'it' ? 'gold-link' : ''}
              style={{
                background: adminLang === 'it' ? '#FAF6F4' : '#FFFFFF',
                border: '1.5px solid ' + (adminLang === 'it' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                borderRadius: '0px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🇮🇹 Italiano
            </button>
            <button
              type="button"
              onClick={() => setAdminLang('en')}
              className={adminLang === 'en' ? 'gold-link' : ''}
              style={{
                background: adminLang === 'en' ? '#FAF6F4' : '#FFFFFF',
                border: '1.5px solid ' + (adminLang === 'en' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                borderRadius: '0px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Dashboard Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'DALI, serif', fontSize: '32px', margin: '0 0 4px 0', color: '#1C1917' }}>
                I Pupi Siciliani · Gestione Sala & Tavoli
              </h1>
              <p style={{ margin: 0, color: 'var(--color-neutral-muted)', fontSize: '14px' }}>
                Pannello operativo per la disposizione dei tavoli, capienza e gestione delle prenotazioni.
              </p>
            </div>

            {/* Quick KPI badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '8px 14px', borderRadius: '0px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-neutral-muted)', display: 'block' }}>Coperti Oggi</span>
                <strong style={{ fontSize: '18px', color: '#333' }}>{totalGuestsToday} pax</strong>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', padding: '8px 14px', borderRadius: '0px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-neutral-muted)', display: 'block' }}>Tavoli Selezionati</span>
                <strong style={{ fontSize: '18px', color: 'var(--color-accent-gold)' }}>
                  {staffSelectedTables.length > 0 ? staffSelectedTables.join(', ') : 'Nessuno'} ({calculateStaffCapacity()} pax)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: INTERACTIVE GRID FLOOR PLAN */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #D1D5DB', padding: '24px', marginBottom: '32px', borderRadius: '0px' }}>
          
          {/* Quick presets row */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-neutral-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Unioni e Combinazioni Rapide:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COMBOS.map((combo) => (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => applyStaffCombo(combo)}
                  style={{
                    padding: '6px 14px',
                    background: combo.isSalettaMerge ? '#FFF5F6' : '#FFFFFF',
                    border: '1.5px solid ' + (combo.isSalettaMerge ? '#B5A642' : '#D1D5DB'),
                    borderRadius: '0px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#333333',
                    cursor: 'pointer'
                  }}
                >
                  {combo.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setStaffSelectedTables([])}
                style={{
                  padding: '6px 14px',
                  background: '#FFF5F6',
                  border: '1px solid #FDB4BF',
                  borderRadius: '0px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#B91C1C',
                  cursor: 'pointer'
                }}
              >
                ✕ Deseleziona tutti
              </button>
            </div>
          </div>

          {/* Grid Floor Plan Component */}
          <TablePlan
            selectedTables={staffSelectedTables}
            onToggleTable={toggleStaffTable}
            guests={calculateStaffCapacity()}
            onConfigChange={setTableConfigs}
          />
        </div>

        {/* SECTION 2: RESERVATIONS LIST */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #D1D5DB', padding: '24px', borderRadius: '0px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1C1917' }}>
                {t.reservationsTitle || 'Prenotazioni Ricevute'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
                Tutte le richieste clienti con allergie, richieste speciali e gestione tavolo.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                style={{
                  padding: '6px 14px',
                  background: dateFilter === 'today' ? '#1C1917' : '#FFFFFF',
                  color: dateFilter === 'today' ? '#FFFFFF' : '#1C1917',
                  border: '1px solid #1C1917',
                  borderRadius: '0px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Oggi ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                style={{
                  padding: '6px 14px',
                  background: dateFilter === 'all' ? '#1C1917' : '#FFFFFF',
                  color: dateFilter === 'all' ? '#FFFFFF' : '#1C1917',
                  border: '1px solid #1C1917',
                  borderRadius: '0px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tutte ({reservations.length})
              </button>
              <button
                type="button"
                onClick={loadReservations}
                style={{
                  padding: '6px 12px',
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Ricarica prenotazioni"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-neutral-muted)' }}>
              Nessuna prenotazione trovata per il filtro selezionato.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #D1D5DB', color: 'var(--color-neutral-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 10px' }}>Cliente</th>
                    <th style={{ padding: '12px 10px' }}>Persone</th>
                    <th style={{ padding: '12px 10px' }}>Data & Ora</th>
                    <th style={{ padding: '12px 10px' }}>Note / Allergie</th>
                    <th style={{ padding: '12px 10px' }}>Stato</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Azione Tavolo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res, idx) => {
                    const pax = parseInt(res.guests_count) || 2;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '14px 10px', fontWeight: 700 }}>
                          {res.customer_name}<br />
                          <small style={{ fontWeight: 400, color: 'var(--color-neutral-muted)' }}>
                            {res.customer_phone} {res.customer_email && `· ${res.customer_email}`}
                          </small>
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '15px' }}>{res.guests_count}</span> pax
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <strong>{res.booking_date}</strong><br />
                          <span>{res.booking_time}</span>
                        </td>
                        <td style={{ padding: '14px 10px', maxWidth: '340px' }}>
                          {res.notes ? (
                            <span style={{
                              background: '#FFF5F6',
                              padding: '4px 8px',
                              borderRadius: '0px',
                              border: '1px solid #FDB4BF',
                              display: 'inline-block',
                              color: '#333333',
                              lineHeight: 1.4
                            }}>
                              {res.notes}
                            </span>
                          ) : (
                            <span style={{ color: '#BBB' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: '#FAF6F4',
                            border: '1px solid #D1D5DB',
                            borderRadius: '0px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {res.status || 'Confermata'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                          {pax >= 6 ? (
                            <button
                              type="button"
                              onClick={() => assignToSaletta(res)}
                              style={{
                                padding: '5px 10px',
                                background: '#FFF5F6',
                                border: '1.5px solid #B5A642',
                                borderRadius: '0px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#333333',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title="Unisci 14, 13, 12 in verticale al centro della saletta per 7 pax"
                            >
                              ✦ Assegna Saletta (7 pax)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setStaffSelectedTables(['5']);
                                alert(`Tavolo assegnato a ${res.customer_name}`);
                              }}
                              style={{
                                padding: '5px 10px',
                                background: '#FFFFFF',
                                border: '1px solid #D1D5DB',
                                borderRadius: '0px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Assegna Tavolo
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
