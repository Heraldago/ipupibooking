import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES } from './TablePlan';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { adminTranslations } from '../i18n';
import { 
  ArrowLeft, 
  Users, 
  Calendar as CalendarIcon, 
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const SEED_RESERVATIONS = [
  {
    id: 'res-julian-7',
    customer_name: 'Julian Andersen',
    customer_phone: '+45 28 91 44 20',
    customer_email: 'julian.andersen@dk-mail.dk',
    guests_count: 7,
    booking_date: '2026-10-17', // Sabato sera
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

const ALL_TABLE_IDS = ['14', '13', '12', '10', '11', '9', '8', '7', '6', '5', '4', '3', '2'];

// Italian Date Formatting Helper
function formatDateItalian(isoStr) {
  try {
    const [y, m, d] = (isoStr || '2026-10-17').split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    return {
      dayName: days[date.getDay()],
      dayNum: d,
      monthName: months[m - 1],
      year: y,
      fullText: `${days[date.getDay()]}, ${d} ${months[m - 1]} ${y}`
    };
  } catch {
    return { dayName: '', dayNum: '', monthName: '', year: '', fullText: isoStr };
  }
}

export default function AdminPage({ onNavigateToBooking }) {
  const [adminLang, setAdminLang] = useState('it');
  const t = adminTranslations[adminLang];

  // Active date filter (Default to Saturday 2026-10-17 for Julian Andersen)
  const [selectedDate, setSelectedDate] = useState('2026-10-17');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Reservations state with persistence
  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem('pupi_admin_reservations_v3');
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
      localStorage.setItem('pupi_admin_reservations_v3', JSON.stringify(reservations));
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

  const totalGuestsOnDate = dayAcceptedReservations.reduce(
    (sum, r) => sum + (parseInt(r.guests_count) || 0),
    0
  );

  // Change date by delta days (-1 or +1)
  const changeDateByDelta = (delta) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + delta);
      const nextY = date.getFullYear();
      const nextM = String(date.getMonth() + 1).padStart(2, '0');
      const nextD = String(date.getDate()).padStart(2, '0');
      setSelectedDate(`${nextY}-${nextM}-${nextD}`);
      // Clear active assigning if switching date
      if (activeAssigningRes && activeAssigningRes.booking_date !== `${nextY}-${nextM}-${nextD}`) {
        setActiveAssigningRes(null);
        setStaffSelectedTables([]);
      }
    } catch (e) {
      console.error('Error changing date', e);
    }
  };

  // Accept a pending request and start table assignment immediately
  const handleAcceptRequest = (res) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'accepted' } : r))
    );
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
    const existing = res.assigned_tables || [];
    setStaffSelectedTables(existing);

    // If 6-8 pax and no tables yet assigned, auto-suggest Saletta 14+13+12
    if (res.guests_count >= 6 && existing.length === 0) {
      setStaffSelectedTables(['14', '13', '12']);
      setIsSalettaMerged(true);
      try {
        localStorage.setItem('pupi_saletta_merged', 'true');
      } catch {}
    }

    // Smoothly scroll down to the floor plan for easy interaction
    const planElement = document.getElementById('floor-plan-section');
    if (planElement) {
      planElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle table selection for the active reservation
  const toggleStaffTable = (id) => {
    if (staffSelectedTables.includes(id)) {
      setStaffSelectedTables(staffSelectedTables.filter((t) => t !== id));
    } else {
      setStaffSelectedTables([...staffSelectedTables, id]);
    }
  };

  // Quick 1-tap Saletta assignment (14, 13, 12)
  const assignSalettaForActive = () => {
    setStaffSelectedTables(['14', '13', '12']);
    setIsSalettaMerged(true);
    try {
      localStorage.setItem('pupi_saletta_merged', 'true');
    } catch {}
  };

  // Unassign single table from a reservation in 1-click
  const unassignTableFromRes = (resId, tableId) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId
          ? { ...r, assigned_tables: (r.assigned_tables || []).filter((t) => t !== tableId) }
          : r
      )
    );
    if (activeAssigningRes && activeAssigningRes.id === resId) {
      setStaffSelectedTables((prev) => prev.filter((t) => t !== tableId));
    }
  };

  // Confirm table assignment for the active reservation
  const confirmAssignment = () => {
    if (!activeAssigningRes) return;
    if (staffSelectedTables.length === 0) {
      alert('Seleziona almeno un tavolo (cliccando sui pulsanti o sulla mappa) per confermare.');
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

    alert(`✓ Tavoli [${staffSelectedTables.join(', ')}] assegnati a ${activeAssigningRes.customer_name}.`);
    setActiveAssigningRes(null);
    setStaffSelectedTables([]);
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

  const formattedDate = formatDateItalian(selectedDate);
  const todayIso = new Date().toISOString().split('T')[0];

  const getDayBadge = () => {
    if (selectedDate === todayIso) return 'OGGI';
    if (selectedDate === '2026-10-17') return 'SABATO SERA · JULIAN ANDERSEN';
    return formattedDate.dayName.toUpperCase();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-inner-wrap">
        
        {/* TOP BAR: Navigation & Language */}
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
              padding: '10px 16px',
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
                padding: '8px 14px',
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
                padding: '8px 14px',
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
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontFamily: 'DALI, serif', fontSize: 'clamp(26px, 4vw, 34px)', margin: '0 0 6px 0', color: '#1C1917' }}>
            I Pupi Siciliani · Gestione Sala & Tavoli
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral-muted)', fontSize: '13px', lineHeight: 1.4 }}>
            Controllo presenze, approvazione richieste clienti ed assegnazione nominale dei tavoli con planimetria interattiva.
          </p>
        </div>

        {/* SECTION 1: ZONA RICHIESTE (PARTE ALTA) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #1C1917',
          padding: '20px',
          marginBottom: '24px',
          borderRadius: '0px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
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
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-muted)', fontWeight: 600 }}>
                {pendingRequests.length} {pendingRequests.length === 1 ? 'richiesta in attesa' : 'richieste in attesa'}
              </span>
            </div>

            <button
              type="button"
              onClick={loadReservations}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
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
              border: '1px dashed #D1D5DB',
              fontSize: '14px'
            }}>
              ✓ Tutte le richieste sono state gestite. Nessuna prenotazione in sospeso.
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
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
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
                        {res.booking_date === '2026-10-17' ? 'Sabato sera (17 Ott)' : res.booking_date} · ore {res.booking_time}
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

                  {/* Actions for Request: Accetta / Rifiuta / Contatta */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '340px' }}>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(res)}
                      style={{
                        flex: '1 1 140px',
                        padding: '10px 14px',
                        background: '#1C1917',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} color="#B5A642" />
                      <span>Accetta ed Assegna</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectRequest(res.id)}
                      style={{
                        padding: '10px 14px',
                        background: '#FFFFFF',
                        color: '#DC2626',
                        border: '1px solid #DC2626',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <X size={15} />
                      <span>Rifiuta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContactModalRes(res)}
                      style={{
                        padding: '10px 14px',
                        background: '#FFFFFF',
                        color: '#1C1917',
                        border: '1px solid #D1D5DB',
                        borderRadius: '0px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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

        {/* SECTION 2: SELETTORE DATA GRANDE & INTUITIVO CON FRECCE E CALENDARIO */}
        <div className="admin-date-hero">
          <div className="admin-date-nav-main">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={() => changeDateByDelta(-1)}
              className="date-arrow-btn"
              title="Giorno precedente"
              aria-label="Giorno precedente"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Large Center Date Display */}
            <div className="date-center-content">
              <span className="date-day-status-pill">
                {getDayBadge()}
              </span>

              <h2 className="date-main-heading">
                {formattedDate.fullText}
              </h2>

              <div className="date-stats-sub">
                {dayAcceptedReservations.length} {dayAcceptedReservations.length === 1 ? 'prenotazione attiva' : 'prenotazioni attive'} · <strong>{totalGuestsOnDate} coperti</strong> confermati
              </div>
            </div>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={() => changeDateByDelta(1)}
              className="date-arrow-btn"
              title="Giorno successivo"
              aria-label="Giorno successivo"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Quick Action Bar: Apri Calendario, Oggi, Sabato 17 Ott */}
          <div className="admin-date-actions-bar">
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="date-cta-btn primary"
            >
              <CalendarIcon size={16} />
              <span>Apri Calendario Mensile</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(todayIso)}
              className={`date-cta-btn ${selectedDate === todayIso ? 'primary' : 'secondary'}`}
            >
              <span>Vai a Oggi</span>
            </button>

            {selectedDate !== '2026-10-17' && (
              <button
                type="button"
                onClick={() => setSelectedDate('2026-10-17')}
                className="date-cta-btn secondary demo"
              >
                <span>★ Sabato sera (17 Ott · Julian Andersen)</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: PLANIMETRIA ED ASSEGNAZIONE TAVOLI */}
        <div 
          id="floor-plan-section"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #1C1917',
            padding: '20px',
            marginBottom: '24px',
            borderRadius: '0px'
          }}
        >
          {/* ACTIVE ASSIGNMENT HERO BANNER */}
          {activeAssigningRes && (
            <div className="assignment-hero-card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
                borderBottom: '1px solid #FDE047',
                paddingBottom: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#1C1917',
                      color: '#FFF',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Assegnazione in corso
                    </span>
                    <strong style={{ fontSize: '18px', color: '#1C1917' }}>
                      {activeAssigningRes.customer_name}
                    </strong>
                    <span style={{
                      background: '#B5A642',
                      color: '#FFF',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {activeAssigningRes.guests_count} persone
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
                      · ore {activeAssigningRes.booking_time}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#444' }}>
                    Posti selezionati:{' '}
                    <strong style={{
                      color: calculateStaffCapacity() >= activeAssigningRes.guests_count ? '#059669' : '#B91C1C',
                      fontSize: '14px'
                    }}>
                      {calculateStaffCapacity()} su {activeAssigningRes.guests_count} richiesti
                    </strong>
                    {calculateStaffCapacity() >= activeAssigningRes.guests_count && ' ✓'}
                    {' · '}Tavoli scelti:{' '}
                    <strong style={{ color: '#1C1917' }}>
                      {staffSelectedTables.length > 0 ? staffSelectedTables.join(', ') : 'Nessuno'}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={confirmAssignment}
                    style={{
                      padding: '10px 18px',
                      background: '#1C1917',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={16} color="#B5A642" />
                    <span>✓ Salva Assegnazione ({staffSelectedTables.length} tavoli)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAssigningRes(null);
                      setStaffSelectedTables([]);
                    }}
                    style={{
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#666',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </div>

              {/* Table Quick-Select Pills Bar */}
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1C1917',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Tavoli disponibili (clicca per selezionare o togliere):
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {ALL_TABLE_IDS.map((tid) => {
                    const isSel = staffSelectedTables.includes(tid);
                    const occupiedByOther = tableAssignments[tid] && tableAssignments[tid].id !== activeAssigningRes.id;
                    const isSalettaTable = ['14', '13', '12'].includes(tid);

                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => toggleStaffTable(tid)}
                        className={`table-pill-button ${isSel ? 'selected' : ''} ${occupiedByOther ? 'occupied' : ''}`}
                        title={occupiedByOther ? `Occupato da ${tableAssignments[tid].customer_name}` : `Tavolo ${tid}`}
                      >
                        {isSel ? `✓ Tavolo ${tid}` : isSalettaTable ? `Tavolo ${tid} (Saletta)` : `Tavolo ${tid}`}
                        {occupiedByOther && ` [${tableAssignments[tid].customer_name.split(' ')[0]}]`}
                      </button>
                    );
                  })}

                  {activeAssigningRes.guests_count >= 6 && (
                    <button
                      type="button"
                      onClick={assignSalettaForActive}
                      style={{
                        padding: '8px 14px',
                        background: '#FFF5F6',
                        border: '1.5px solid #B5A642',
                        color: '#1C1917',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: '0px'
                      }}
                    >
                      ✦ Unisci Saletta 14+13+12 (7 pax)
                    </button>
                  )}

                  {staffSelectedTables.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStaffSelectedTables([])}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px dashed #DC2626',
                        color: '#DC2626',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Svuota
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-neutral-muted)' }}>
                  💡 Puoi anche cliccare direttamente sui tavoli nella mappa sottostante per selezionarli o deselezionarli.
                </div>
              </div>
            </div>
          )}

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

        {/* SECTION 4: ACCETTAZIONI DEL GIORNO SELEZIONATO */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #D1D5DB',
          padding: '20px',
          borderRadius: '0px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '19px', color: '#1C1917' }}>
                Accettazioni del Giorno ({formattedDate.dayName} {formattedDate.dayNum} {formattedDate.monthName})
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-neutral-muted)' }}>
                Gestisci lo stato degli ospiti (siede / non presenta) e assegna i tavoli.
              </p>
            </div>

            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-accent-gold)' }}>
              Totale Ospiti: {totalGuestsOnDate} pax
            </span>
          </div>

          {dayAcceptedReservations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-neutral-muted)', background: '#FAF6F4', fontSize: '14px' }}>
              Nessuna prenotazione accettata per questa data.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayAcceptedReservations.map((res) => {
                const isCurrentAssigning = activeAssigningRes && activeAssigningRes.id === res.id;
                const hasTables = res.assigned_tables && res.assigned_tables.length > 0;

                return (
                  <div
                    key={res.id}
                    style={{
                      background: isCurrentAssigning ? '#FFFDF5' : '#FFFFFF',
                      border: isCurrentAssigning ? '2px solid #B5A642' : '1px solid #E5E7EB',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ minWidth: '220px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '17px', color: '#1C1917' }}>{res.customer_name}</strong>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-accent-gold)' }}>
                          {res.guests_count} persone
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-neutral-muted)' }}>
                          · ore {res.booking_time}
                        </span>
                      </div>

                      {/* Tables row with 1-click unassign chips */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ color: 'var(--color-neutral-muted)', fontWeight: 600 }}>Tavoli assegnati:</span>
                        {hasTables ? (
                          res.assigned_tables.map((tid) => (
                            <span
                              key={tid}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#1C1917',
                                color: '#FFFFFF',
                                padding: '3px 8px',
                                fontWeight: 800,
                                fontSize: '12px'
                              }}
                            >
                              Tavolo {tid}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unassignTableFromRes(res.id, tid);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#FDB4BF',
                                  cursor: 'pointer',
                                  padding: '0 2px',
                                  fontSize: '11px',
                                  lineHeight: 1
                                }}
                                title={`Rimuovi tavolo ${tid}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#B91C1C', fontWeight: 700 }}>
                            ⚠️ Nessun tavolo assegnato
                          </span>
                        )}

                        {res.notes && (
                          <span style={{ color: '#666', fontStyle: 'italic', marginLeft: '6px', width: '100%' }}>
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
                          padding: '8px 12px',
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
                          padding: '8px 12px',
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
                          padding: '8px 12px',
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
                          padding: '8px 16px',
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

        {/* FULL INTERACTIVE CALENDAR MODAL */}
        {isCalendarOpen && (
          <AdminCalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              setSelectedDate(newDate);
              setIsCalendarOpen(false);
            }}
            reservations={reservations}
          />
        )}

        {/* CONTACT MODAL DIALOG */}
        {contactModalRes && (
          <div className="admin-cal-modal-overlay">
            <div className="admin-cal-modal-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1C1917' }}>
                  Contatta {contactModalRes.customer_name}
                </h3>
                <button
                  type="button"
                  onClick={() => setContactModalRes(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
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
                  padding: '12px',
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

// Full Month Calendar Modal Component
function AdminCalendarModal({ isOpen, onClose, selectedDate, onSelectDate, reservations = [] }) {
  const [viewDate, setViewDate] = useState(() => {
    try {
      const [y, m] = (selectedDate || '2026-10-17').split('-').map(Number);
      return new Date(y, m - 1, 1);
    } catch {
      return new Date();
    }
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const changeMonth = (delta) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 0 is Sunday in JS, so convert to Monday = 0
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="admin-cal-modal-overlay" onClick={onClose}>
      <div className="admin-cal-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header with Month Nav */}
        <div className="cal-header-row">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1C1917',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Mese precedente"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="cal-month-title">
            {monthNames[month]} {year}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #1C1917',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Mese successivo"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday Labels (Lun - Dom) */}
        <div className="cal-weekdays-grid">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="cal-days-grid">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="cal-day-cell empty" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = iso === selectedDate;
            const isToday = iso === todayIso;

            // Check if reservations exist on this date
            const dayResCount = reservations.filter(
              (r) => r.booking_date === iso && r.status !== 'rejected'
            ).length;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(iso)}
                className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              >
                <span>{dayNum}</span>
                {dayResCount > 0 && <span className="cal-res-dot" title={`${dayResCount} prenotazioni`} />}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onSelectDate(todayIso)}
            style={{
              padding: '8px 14px',
              background: '#FAF6F4',
              border: '1px solid #D1D5DB',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Oggi
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              background: '#1C1917',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
