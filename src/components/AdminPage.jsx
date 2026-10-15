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
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';

const SEED_RESERVATIONS = [
  {
    id: 'res-julian-7',
    customer_name: 'Julian Andersen',
    customer_phone: '+45 28 91 44 20',
    customer_email: 'julian.andersen@dk-mail.dk',
    guests_count: 7,
    booking_date: '2026-10-17', // Sabato
    booking_time: '20:00',
    service_type: 'dinner',
    notes: 'Compleanno in famiglia. Gradita saletta riservata.',
    status: 'pending', // 'pending' | 'accepted' | 'rejected' | 'seated' | 'noshow'
    assigned_tables: []
  },
  {
    id: 'res-mette-4',
    customer_name: 'Mette Lindberg',
    customer_phone: '+45 31 77 02 11',
    customer_email: 'mette.l@kbh.dk',
    guests_count: 4,
    booking_date: '2026-10-17',
    booking_time: '20:15',
    service_type: 'dinner',
    notes: 'Tavolo finestre Vindegade.',
    status: 'accepted',
    assigned_tables: ['10', '11']
  },
  {
    id: 'res-frederik-2',
    customer_name: 'Frederik Møller',
    customer_phone: '+45 42 15 88 90',
    customer_email: 'f.moeller@post.dk',
    guests_count: 2,
    booking_date: '2026-10-17',
    booking_time: '19:30',
    service_type: 'dinner',
    notes: 'Anniversario di matrimonio.',
    status: 'accepted',
    assigned_tables: ['9']
  },
  {
    id: 'res-lars-2',
    customer_name: 'Lars Nielsen',
    customer_phone: '+45 20 63 41 85',
    customer_email: 'lars.nielsen@nordic.com',
    guests_count: 2,
    booking_date: '2026-10-17',
    booking_time: '19:00',
    service_type: 'dinner',
    notes: '',
    status: 'seated', // Siede
    assigned_tables: ['2']
  }
];

export default function AdminPage({ onNavigateToBooking }) {
  const [adminLang, setAdminLang] = useState('it');
  const t = adminTranslations[adminLang];

  // Active date filter (Default to Saturday 2026-10-17 for Julian Andersen)
  const [selectedDate, setSelectedDate] = useState('2026-10-17');

  // Reservations state
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_admin_reservations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_RESERVATIONS;
  });

  const [staffSelectedTables, setStaffSelectedTables] = useState([]);
  const [tableConfigs, setTableConfigs] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active reservation being assigned to tables
  const [activeAssigningRes, setActiveAssigningRes] = useState(null);

  // Active reservation opened in Contact Modal
  const [contactModalRes, setContactModalRes] = useState(null);

  // Saletta banquet mode state
  const [isSalettaMerged, setIsSalettaMerged] = useState(() => {
    try {
      return localStorage.getItem('pupi_saletta_merged') === 'true';
    } catch {
      return false;
    }
  });

  // Save reservations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pupi_admin_reservations_v2', JSON.stringify(reservations));
    } catch {}
  }, [reservations]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Merge with seed to preserve Julian Andersen demo if needed
          setReservations(data);
        }
      }
    } catch (e) {
      console.warn('Could not load from Supabase', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // Compute table assignments map for the selected date: { [tableId]: reservation }
  const tableAssignments = {};
  reservations
    .filter((r) => r.booking_date === selectedDate && r.status !== 'rejected')
    .forEach((r) => {
      (r.assigned_tables || []).forEach((tid) => {
        tableAssignments[tid] = r;
      });
    });

  // Filter reservations
  const pendingRequests = reservations.filter((r) => r.status === 'pending');
  const dayAcceptedReservations = reservations.filter(
    (r) => r.booking_date === selectedDate && ['accepted', 'seated', 'noshow'].includes(r.status)
  );

  // Accept a pending request
  const handleAcceptRequest = (res) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'accepted' } : r))
    );
    // Switch view to request's date and activate table assignment
    setSelectedDate(res.booking_date);
    startAssigningReservation(res);
  };

  // Reject a request
  const handleRejectRequest = (id) => {
    if (window.confirm('Vuoi rifiutare questa richiesta di prenotazione?')) {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'rejected', assigned_tables: [] } : r
        )
      );
      if (activeAssigningRes && activeAssigningRes.id === id) {
        setActiveAssigningRes(null);
        setStaffSelectedTables([]);
      }
    }
  };

  // Change reservation status: 'seated' | 'noshow' | 'accepted'
  const handleSetStatus = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Start assigning tables for a reservation
  const startAssigningReservation = (res) => {
    setActiveAssigningRes(res);
    setStaffSelectedTables(res.assigned_tables || []);
    // If 6-8 pax, suggest Saletta
    if (res.guests_count >= 6 && (!res.assigned_tables || res.assigned_tables.length === 0)) {
      setStaffSelectedTables(['14', '13', '12']);
      setIsSalettaMerged(true);
    }
  };

  // Confirm table assignment for the active reservation
  const confirmAssignment = () => {
    if (!activeAssigningRes) return;
    if (staffSelectedTables.length === 0) {
      alert('Seleziona almeno un tavolo sulla piantina per confermare l\'assegnazione.');
      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === activeAssigningRes.id
          ? { ...r, assigned_tables: staffSelectedTables, status: r.status === 'pending' ? 'accepted' : r.status }
          : r
      )
    );

    // If Saletta 14, 13, 12 were assigned and guests >= 6, keep merged
    const hasSaletta = ['14', '13', '12'].every((tid) => staffSelectedTables.includes(tid));
    if (hasSaletta && activeAssigningRes.guests_count >= 6) {
      setIsSalettaMerged(true);
      try {
        localStorage.setItem('pupi_saletta_merged', 'true');
      } catch {}
    }

    alert(`Assegnazione completata per ${activeAssigningRes.customer_name}: Tavoli [${staffSelectedTables.join(', ')}].`);
    setActiveAssigningRes(null);
    setStaffSelectedTables([]);
  };

  // Quick 1-click Saletta assignment for 7 pax
  const assignSalettaForActive = () => {
    setStaffSelectedTables(['14', '13', '12']);
    setIsSalettaMerged(true);
    try {
      localStorage.setItem('pupi_saletta_merged', 'true');
    } catch {}
  };

  // Toggle table selection
  const toggleStaffTable = (id) => {
    if (staffSelectedTables.includes(id)) {
      setStaffSelectedTables(staffSelectedTables.filter((t) => t !== id));
    } else {
      setStaffSelectedTables([...staffSelectedTables, id]);
    }
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F4', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Top bar: Navigation & Language */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
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

        {/* Dashboard Title Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'DALI, serif', fontSize: '30px', margin: '0 0 4px 0', color: '#1C1917' }}>
            I Pupi Siciliani · Gestione Sala & Prenotazioni
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral-muted)', fontSize: '13px' }}>
            Pannello operativo per approvazione richieste, assegnazione tavoli nominale e planimetria interattiva.
          </p>
        </div>

        {/* SECTION 1: ZONA RICHIESTE (PARTE ALTA COME RICHIESTO) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #1C1917',
          padding: '20px',
          marginBottom: '24px',
          borderRadius: '0px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#B5A642',
                color: '#FFFFFF',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Zona Richieste in Arrivo
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
                {pendingRequests.length} {pendingRequests.length === 1 ? 'richiesta in attesa di approvazione' : 'richieste in attesa'}
              </span>
            </div>

            <button
              type="button"
              onClick={loadReservations}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                padding: '5px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} />
              <span>Ricarica</span>
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-neutral-muted)',
              background: '#FAF6F4',
              border: '1px dashed #D1D5DB'
            }}>
              ✓ Tutte le richieste sono state gestite. Nessuna richiesta in sospeso.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingRequests.map((res) => (
                <div
                  key={res.id}
                  style={{
                    background: '#FFFDF5',
                    border: '1.5px solid #B5A642',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '18px', color: '#1C1917' }}>{res.customer_name}</strong>
                      <span style={{
                        background: '#1C1917',
                        color: '#FFF',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {res.guests_count} persone
                      </span>
                      <span style={{
                        background: '#FAF6F4',
                        border: '1px solid #D1D5DB',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {res.booking_date === '2026-10-17' ? 'Sabato sera (17 Ott)' : res.booking_date} · {res.booking_time}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--color-neutral-muted)', marginBottom: '4px' }}>
                      <span>Tel: <strong>{res.customer_phone}</strong></span>
                      {res.customer_email && <span style={{ marginLeft: '12px' }}>Email: <strong>{res.customer_email}</strong></span>}
                    </div>

                    {res.notes && (
                      <div style={{
                        fontSize: '12px',
                        color: '#854D0E',
                        background: '#FEF9C3',
                        padding: '4px 8px',
                        display: 'inline-block',
                        border: '1px solid #FDE047',
                        marginTop: '4px'
                      }}>
                        💬 Nota cliente: {res.notes}
                      </div>
                    )}
                  </div>

                  {/* Quick Action buttons for Request: Accetta / Rifiuta / Contatta */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(res)}
                      style={{
                        padding: '8px 16px',
                        background: '#1C1917',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} color="#B5A642" />
                      <span>Accetta Richiesta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectRequest(res.id)}
                      style={{
                        padding: '8px 14px',
                        background: '#FFFFFF',
                        color: '#DC2626',
                        border: '1px solid #DC2626',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <X size={15} />
                      <span>Rifiuta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContactModalRes(res)}
                      style={{
                        padding: '8px 14px',
                        background: '#FFFFFF',
                        color: '#1C1917',
                        border: '1px solid #D1D5DB',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={14} color="#B5A642" />
                      <span>Contatta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: SELETTORE DEL GIORNO & PLANIMETRIA CON ASSEGNAZIONE */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D1D5DB',
          padding: '20px',
          marginBottom: '24px',
          borderRadius: '0px'
        }}>
          {/* Day Selector Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--color-neutral-muted)', display: 'block' }}>
                Giorno Selezionato:
              </span>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#1C1917' }}>
                {selectedDate === '2026-10-17' ? 'Sabato Sera · 17 Ottobre 2026' : `Data: ${selectedDate}`}
              </h2>
            </div>

            {/* Quick Date Pills */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedDate('2026-10-17')}
                style={{
                  padding: '7px 14px',
                  background: selectedDate === '2026-10-17' ? '#1C1917' : '#FFFFFF',
                  color: selectedDate === '2026-10-17' ? '#FFFFFF' : '#1C1917',
                  border: '1.5px solid #1C1917',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ★ Sabato sera (17 Ott)
              </button>

              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setSelectedDate(today);
                }}
                style={{
                  padding: '7px 14px',
                  background: selectedDate === new Date().toISOString().split('T')[0] ? '#1C1917' : '#FFFFFF',
                  color: selectedDate === new Date().toISOString().split('T')[0] ? '#FFFFFF' : '#1C1917',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Oggi
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-neutral-muted)' }}>Altro giorno:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '12px',
                    borderRadius: '0px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ACTIVE ASSIGNMENT BANNER WHEN STAFF SELECTS A BOOKING */}
          {activeAssigningRes && (
            <div style={{
              background: '#FFFDF5',
              border: '2px solid #B5A642',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#B5A642', color: '#FFF', padding: '2px 8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                    Assegnazione in corso
                  </span>
                  <strong style={{ fontSize: '16px', color: '#1C1917' }}>
                    {activeAssigningRes.customer_name} ({activeAssigningRes.guests_count} persone)
                  </strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-neutral-muted)', marginTop: '4px' }}>
                  Seleziona i tavoli sulla griglia per questa prenotazione. Tavoli attualmente scelti:{' '}
                  <strong style={{ color: '#1C1917' }}>
                    {staffSelectedTables.length > 0 ? staffSelectedTables.join(', ') : 'Nessuno'}
                  </strong>{' '}
                  ({calculateStaffCapacity()} pax)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {activeAssigningRes.guests_count >= 6 && (
                  <button
                    type="button"
                    onClick={assignSalettaForActive}
                    style={{
                      padding: '7px 12px',
                      background: '#FFF5F6',
                      border: '1.5px solid #B5A642',
                      color: '#333',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✦ Seleziona Saletta (14+13+12)
                  </button>
                )}

                <button
                  type="button"
                  onClick={confirmAssignment}
                  style={{
                    padding: '7px 16px',
                    background: '#1C1917',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✓ Salva Assegnazione Tavoli
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAssigningRes(null);
                    setStaffSelectedTables([]);
                  }}
                  style={{
                    padding: '7px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    color: '#666',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {/* Quick presets row */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-neutral-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Combinazioni Rapide:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COMBOS.map((combo) => (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => {
                    setStaffSelectedTables(combo.tables);
                    if (combo.isSalettaMerge) {
                      setIsSalettaMerged(true);
                      try { localStorage.setItem('pupi_saletta_merged', 'true'); } catch {}
                    }
                  }}
                  style={{
                    padding: '5px 12px',
                    background: combo.isSalettaMerge ? '#FFF5F6' : '#FFFFFF',
                    border: '1.2px solid ' + (combo.isSalettaMerge ? '#B5A642' : '#D1D5DB'),
                    borderRadius: '0px',
                    fontSize: '11px',
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
                  padding: '5px 12px',
                  background: '#FFF5F6',
                  border: '1px solid #FDB4BF',
                  borderRadius: '0px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#B91C1C',
                  cursor: 'pointer'
                }}
              >
                ✕ Deseleziona tutti
              </button>
            </div>
          </div>

          {/* Interactive Grid Floor Plan Component */}
          <TablePlan
            selectedTables={staffSelectedTables}
            onToggleTable={toggleStaffTable}
            guests={calculateStaffCapacity()}
            onConfigChange={setTableConfigs}
            tableAssignments={tableAssignments}
            isSalettaMerged={isSalettaMerged}
            onToggleSalettaMerge={setIsSalettaMerged}
          />
        </div>

        {/* SECTION 3: ACCETTAZIONI DEL GIORNO SELEZIONATO */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D1D5DB',
          padding: '20px',
          borderRadius: '0px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', color: '#1C1917' }}>
                Accettazioni del Giorno ({selectedDate})
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
                Seleziona una prenotazione per assegnare o modificare i tavoli sulla piantina.
              </p>
            </div>

            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent-gold)' }}>
              Totale Ospiti: {dayAcceptedReservations.reduce((sum, r) => sum + (parseInt(r.guests_count) || 0), 0)} pax
            </span>
          </div>

          {dayAcceptedReservations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-neutral-muted)', background: '#FAF6F4' }}>
              Nessuna prenotazione accettata per questo giorno.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dayAcceptedReservations.map((res) => {
                const isCurrentAssigning = activeAssigningRes && activeAssigningRes.id === res.id;
                const hasTables = res.assigned_tables && res.assigned_tables.length > 0;

                return (
                  <div
                    key={res.id}
                    style={{
                      background: isCurrentAssigning ? '#FFFDF5' : '#FFFFFF',
                      border: isCurrentAssigning ? '2px solid #B5A642' : '1px solid #E5E7EB',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '16px', color: '#1C1917' }}>{res.customer_name}</strong>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-accent-gold)' }}>
                          {res.guests_count} pax
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-neutral-muted)' }}>
                          · ore {res.booking_time}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ color: 'var(--color-neutral-muted)' }}>Tavoli assegnati:</span>
                        {hasTables ? (
                          <span style={{
                            background: '#1C1917',
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            fontWeight: 800
                          }}>
                            {res.assigned_tables.join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: '#B91C1C', fontWeight: 700 }}>
                            ⚠️ Da assegnare
                          </span>
                        )}

                        {res.notes && (
                          <span style={{ color: '#666', fontStyle: 'italic', marginLeft: '6px' }}>
                            «{res.notes}»
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons: Siede / Non si presenta / Contatta / Assegna Tavoli */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Siede Toggle */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(res.id, res.status === 'seated' ? 'accepted' : 'seated')}
                        style={{
                          padding: '6px 12px',
                          background: res.status === 'seated' ? '#059669' : '#FFFFFF',
                          color: res.status === 'seated' ? '#FFFFFF' : '#059669',
                          border: '1.5px solid #059669',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserCheck size={14} />
                        <span>{res.status === 'seated' ? '✓ Al Tavolo (Siede)' : 'Siede'}</span>
                      </button>

                      {/* Non si presenta */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(res.id, res.status === 'noshow' ? 'accepted' : 'noshow')}
                        style={{
                          padding: '6px 12px',
                          background: res.status === 'noshow' ? '#DC2626' : '#FFFFFF',
                          color: res.status === 'noshow' ? '#FFFFFF' : '#666',
                          border: '1px solid ' + (res.status === 'noshow' ? '#DC2626' : '#D1D5DB'),
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserX size={14} />
                        <span>{res.status === 'noshow' ? '✕ No-Show' : 'Non presenta'}</span>
                      </button>

                      {/* Contatta */}
                      <button
                        type="button"
                        onClick={() => setContactModalRes(res)}
                        style={{
                          padding: '6px 12px',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          color: '#1C1917',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Phone size={13} color="#B5A642" />
                        <span>Contatta</span>
                      </button>

                      {/* Assegna Tavoli */}
                      <button
                        type="button"
                        onClick={() => startAssigningReservation(res)}
                        style={{
                          padding: '6px 14px',
                          background: isCurrentAssigning ? '#B5A642' : '#1C1917',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isCurrentAssigning ? '● Assegnazione Attiva' : '🪑 Assegna Tavoli'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTACT MODAL DIALOG */}
        {contactModalRes && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #1C1917',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1C1917' }}>
                  Contatta {contactModalRes.customer_name}
                </h3>
                <button
                  type="button"
                  onClick={() => setContactModalRes(null)}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--color-neutral-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Prenotazione: <strong>{contactModalRes.guests_count} persone</strong> per il{' '}
                <strong>{contactModalRes.booking_date}</strong> alle <strong>{contactModalRes.booking_time}</strong>.
                {contactModalRes.notes && <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Note: {contactModalRes.notes}</div>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* Direct Phone Call */}
                <a
                  href={`tel:${contactModalRes.customer_phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: '#FAF6F4',
                    border: '1px solid #D1D5DB',
                    textDecoration: 'none',
                    color: '#1C1917',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <Phone size={18} color="#B5A642" />
                  <span>Chiama subito: {contactModalRes.customer_phone}</span>
                </a>

                {/* WhatsApp Chat */}
                <a
                  href={`https://wa.me/${contactModalRes.customer_phone.replace(/[^0-9]/g, '')}?text=Hej%20${encodeURIComponent(contactModalRes.customer_name)},%20vi%20kontakter%20jer%20angående%20jeres%20reservation%20hos%20I%20Pupi%20Siciliani.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Apri chat WhatsApp</span>
                </a>

                {/* Direct Email */}
                {contactModalRes.customer_email && (
                  <a
                    href={`mailto:${contactModalRes.customer_email}?subject=Reservation%20hos%20I%20Pupi%20Siciliani&body=Kære%20${encodeURIComponent(contactModalRes.customer_name)},`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      textDecoration: 'none',
                      color: '#1C1917',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}
                  >
                    <Mail size={18} color="#B5A642" />
                    <span>Invia Email a {contactModalRes.customer_email}</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setContactModalRes(null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1C1917',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Chiudi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
