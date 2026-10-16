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
    assigned_tables: ['5'] // Tavolo 5 in modo che 2, 3, 4 siano liberi per Julian Andersen o gruppi da 6-8 pax
  }
];

const ALL_TABLE_IDS = ['14', '13', '12', '10', '11', '9', '8', '7', '6', '5', '4', '3', '2'];

// Restaurant natural pairings and single options for 1-click game-like assignment
export const RESTAURANT_COMBOS = [
  { id: 'pair-10-11', tables: ['10', '11'], label: 'Tavolo 10 + 11', zone: 'Finestra Vindegade', pax: 4 },
  { id: 'pair-7-8', tables: ['7', '8'], label: 'Tavolo 7 + 8', zone: 'Parete Sinistra', pax: 4 },
  { id: 'pair-5-6', tables: ['5', '6'], label: 'Tavolo 5 + 6', zone: 'Centro Sala', pax: 4 },
  { id: 'pair-3-4', tables: ['3', '4'], label: 'Tavolo 3 + 4', zone: 'Parete Destra', pax: 4 },
  { id: 'trio-2-3-4', tables: ['2', '3', '4'], label: 'Tavolata Parete Destra (2 + 3 + 4)', zone: 'Parete Destra (Uniti 6-8p)', pax: 8, isTrio: true },
  { id: 'saletta-banquet', tables: ['14', '13', '12'], label: 'Saletta Privata (14 + 13 + 12)', zone: 'Saletta Unita (7p)', pax: 7, isSaletta: true }
];

export const SINGLE_TABLE_OPTIONS = [
  { id: 'opt-9', tables: ['9'], label: 'Tavolo 9', zone: 'Finestra Sinistra', pax: 2 },
  { id: 'opt-10', tables: ['10'], label: 'Tavolo 10', zone: 'Finestra Centro', pax: 2 },
  { id: 'opt-11', tables: ['11'], label: 'Tavolo 11', zone: 'Finestra Centro', pax: 2 },
  { id: 'opt-2', tables: ['2'], label: 'Tavolo 2', zone: 'Finestra Destra', pax: 2 },
  { id: 'opt-7', tables: ['7'], label: 'Tavolo 7', zone: 'Parete Sinistra', pax: 2 },
  { id: 'opt-5', tables: ['5'], label: 'Tavolo 5', zone: 'Centro Sala', pax: 2 },
  { id: 'opt-3', tables: ['3'], label: 'Tavolo 3', zone: 'Parete Destra', pax: 2 },
  { id: 'opt-8', tables: ['8'], label: 'Tavolo 8', zone: 'Fondo Sinistra', pax: 2 },
  { id: 'opt-6', tables: ['6'], label: 'Tavolo 6', zone: 'Fondo Centro', pax: 2 },
  { id: 'opt-4', tables: ['4'], label: 'Tavolo 4', zone: 'Fondo Destra', pax: 2 }
];

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
      const saved = localStorage.getItem('pupi_admin_reservations_v4');
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
      localStorage.setItem('pupi_admin_reservations_v4', JSON.stringify(reservations));
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

  // Helper: compute available options for a reservation
  const getAvailableOptionsForRes = (res) => {
    if (!res) return [];
    const guests = parseInt(res.guests_count, 10) || 2;

    if (guests <= 2) {
      return SINGLE_TABLE_OPTIONS.filter((opt) => {
        const tid = opt.tables[0];
        const isOccupiedByOther = tableAssignments[tid] && tableAssignments[tid].id !== res.id;
        return !isOccupiedByOther;
      });
    }

    if (guests <= 4) {
      return RESTAURANT_COMBOS.filter((c) => c.pax === 4).filter((c) => {
        return c.tables.every(
          (tid) => !tableAssignments[tid] || tableAssignments[tid].id === res.id
        );
      });
    }

    // 5 to 8 pax: Saletta banquet or Trio Parete Destra (2 + 3 + 4)
    const options = [];
    const trioFree = ['2', '3', '4'].every(
      (tid) => !tableAssignments[tid] || tableAssignments[tid].id === res.id
    );
    if (trioFree) {
      const t = RESTAURANT_COMBOS.find((c) => c.isTrio);
      if (t) options.push(t);
    }

    const salettaFree = ['14', '13', '12'].every(
      (tid) => !tableAssignments[tid] || tableAssignments[tid].id === res.id
    );
    if (salettaFree) {
      const s = RESTAURANT_COMBOS.find((c) => c.isSaletta);
      if (s) options.push(s);
    }

    return options;
  };

  // 1-Click Apply Combo
  const applyCombo = (combo) => {
    setStaffSelectedTables(combo.tables);
    if (combo.isSaletta) {
      setIsSalettaMerged(true);
      try {
        localStorage.setItem('pupi_saletta_merged', 'true');
      } catch {}
    } else {
      setIsSalettaMerged(false);
      try {
        localStorage.setItem('pupi_saletta_merged', 'false');
      } catch {}
    }
  };

  // Start assigning tables for a reservation (Game-like initiation)
  const startAssigningReservation = (res) => {
    setActiveAssigningRes(res);
    const existing = res.assigned_tables || [];
    const guests = parseInt(res.guests_count, 10) || 2;

    if (existing.length > 0) {
      setStaffSelectedTables(existing);
      const isSaletta = ['14', '13', '12'].every((t) => existing.includes(t));
      setIsSalettaMerged(isSaletta);
    } else {
      // Game-like smart auto-proposal:
      if (guests >= 5) {
        // Prefer 2 + 3 + 4 if free, else Saletta
        const trioFree = ['2', '3', '4'].every(
          (tid) => !tableAssignments[tid] || tableAssignments[tid].id === res.id
        );
        if (trioFree) {
          setStaffSelectedTables(['2', '3', '4']);
          setIsSalettaMerged(false);
        } else {
          setStaffSelectedTables(['14', '13', '12']);
          setIsSalettaMerged(true);
        }
      } else if (guests <= 4 && guests > 2) {
        // Pick first completely free 4-pax pair
        const freePair = RESTAURANT_COMBOS.find(
          (c) => c.pax === 4 && c.tables.every((tid) => !tableAssignments[tid] || tableAssignments[tid].id === res.id)
        );
        if (freePair) {
          setStaffSelectedTables(freePair.tables);
        } else {
          setStaffSelectedTables([]);
        }
      } else {
        // 1-2 pax: pick first free single table
        const freeSingle = SINGLE_TABLE_OPTIONS.find(
          (opt) => !tableAssignments[opt.tables[0]] || tableAssignments[opt.tables[0]].id === res.id
        );
        if (freeSingle) {
          setStaffSelectedTables(freeSingle.tables);
        } else {
          setStaffSelectedTables([]);
        }
      }
    }

    // Smoothly scroll down to the floor plan for easy interaction
    const planElement = document.getElementById('floor-plan-section');
    if (planElement) {
      planElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle table selection with STRICT capacity check and smart pair coupling
  const toggleStaffTable = (id) => {
    if (!activeAssigningRes) return;
    const guests = parseInt(activeAssigningRes.guests_count, 10) || 2;

    // Deselect if already selected
    if (staffSelectedTables.includes(id)) {
      setStaffSelectedTables(staffSelectedTables.filter((t) => t !== id));
      return;
    }

    // Block if occupied by another guest
    const isOccupiedByOther = tableAssignments[id] && tableAssignments[id].id !== activeAssigningRes.id;
    if (isOccupiedByOther) {
      alert(`Il Tavolo ${id} è già occupato da ${tableAssignments[id].customer_name}! Scegli un tavolo verde libero.`);
      return;
    }

    // 1-2 Pax: Exactly 1 table (2 seats). Tapping another table replaces selection
    if (guests <= 2) {
      setStaffSelectedTables([id]);
      return;
    }

    // 3-4 Pax: Maximum 2 tables (4 seats)
    if (guests <= 4) {
      // If 0 tables chosen: smart-couple with adjacent pair if free
      if (staffSelectedTables.length === 0) {
        const pair = RESTAURANT_COMBOS.find((c) => c.pax === 4 && c.tables.includes(id));
        if (pair) {
          const bothFree = pair.tables.every(
            (tid) => !tableAssignments[tid] || tableAssignments[tid].id === activeAssigningRes.id
          );
          if (bothFree) {
            setStaffSelectedTables(pair.tables);
            return;
          }
        }
        setStaffSelectedTables([id]);
        return;
      }

      // If 1 table already chosen: add this 2nd table (total 2 tables = 4 seats)
      if (staffSelectedTables.length === 1) {
        setStaffSelectedTables([...staffSelectedTables, id]);
        return;
      }

      // If already 2 tables chosen (4 seats): PREVENT adding 3rd or 4th table!
      alert(`Hai già selezionato 2 tavoli (4 posti). Per cambiare tavolo, tocca un tavolo selezionato per toglierlo oppure clicca su una delle opzioni rapide in alto.`);
      return;
    }

    // 5+ Pax (6, 7, 8 pax):
    // Saletta tables (14, 13, 12)
    if (['14', '13', '12'].includes(id)) {
      setStaffSelectedTables(['14', '13', '12']);
      setIsSalettaMerged(true);
      try {
        localStorage.setItem('pupi_saletta_merged', 'true');
      } catch {}
      return;
    }

    // Parete Destra (2, 3, 4)
    if (['2', '3', '4'].includes(id)) {
      setIsSalettaMerged(false);
      try {
        localStorage.setItem('pupi_saletta_merged', 'false');
      } catch {}

      // If switching from Saletta or empty, 1-tap select all 3
      const hadSaletta = staffSelectedTables.some((t) => ['14', '13', '12'].includes(t));
      if (staffSelectedTables.length === 0 || hadSaletta) {
        const trioFree = ['2', '3', '4'].every(
          (tid) => !tableAssignments[tid] || tableAssignments[tid].id === activeAssigningRes.id
        );
        if (trioFree) {
          setStaffSelectedTables(['2', '3', '4']);
          return;
        }
      }
    }

    const cleanSelection = staffSelectedTables.filter((t) => !['14', '13', '12'].includes(t));
    if (cleanSelection.length >= 3) {
      alert(`Hai già raggiunto la capienza massima per questa prenotazione (${guests} persone: 3 tavoli uniti da 8 posti).`);
      return;
    }

    setStaffSelectedTables([...cleanSelection, id]);
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
      alert('Seleziona almeno un tavolo (cliccando sulla mappa o su un\'opzione rapida) per confermare.');
      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === activeAssigningRes.id
          ? { ...r, assigned_tables: staffSelectedTables, status: r.status === 'pending' ? 'accepted' : r.status }
          : r
      )
    );

    // If Saletta 14, 13, 12 were assigned and guests >= 5, keep merged
    const hasSaletta = ['14', '13', '12'].every((tid) => staffSelectedTables.includes(tid));
    if (hasSaletta && activeAssigningRes.guests_count >= 5) {
      setIsSalettaMerged(true);
      try {
        localStorage.setItem('pupi_saletta_merged', 'true');
      } catch {}
    }

    alert(`✓ Tavolo/i [${staffSelectedTables.join(', ')}] assegnati con successo a ${activeAssigningRes.customer_name}!`);
    setActiveAssigningRes(null);
    setStaffSelectedTables([]);
  };

  const isReadyToConfirm = () => {
    if (!activeAssigningRes) return false;
    const guests = parseInt(activeAssigningRes.guests_count, 10) || 2;
    if (guests <= 2) return staffSelectedTables.length === 1;
    if (guests <= 4) return staffSelectedTables.length === 2;
    // 5 to 8 pax: 3 tables united (covers 6, 7, 8 pax)
    return staffSelectedTables.length === 3;
  };

  const calculateStaffCapacity = () => {
    if (staffSelectedTables.length >= 3) return 8;
    if (staffSelectedTables.length === 2) return 4;
    if (staffSelectedTables.length === 1) return 2;
    return 0;
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
          {/* ACTIVE ASSIGNMENT GAME-LIKE CONTROL PANEL */}
          {activeAssigningRes && (
            <div className="game-assignment-panel">
              {/* Header with guest card & progress meter */}
              <div className="game-assignment-header">
                <div className="game-guest-badge">
                  <div className="game-guest-avatar">
                    {Array.from({ length: Math.min(activeAssigningRes.guests_count, 8) }).map((_, i) => (
                      <span key={i} role="img" aria-label="ospite">👤</span>
                    ))}
                  </div>
                  <div>
                    <div className="game-guest-title">
                      Stai sistemando: <strong>{activeAssigningRes.customer_name}</strong>
                    </div>
                    <div className="game-guest-subtitle">
                      <span className="badge-pax">{activeAssigningRes.guests_count} persone</span>
                      <span>· ore {activeAssigningRes.booking_time}</span>
                      <span>· {formatDateItalian(activeAssigningRes.booking_date).dayName}</span>
                      {activeAssigningRes.notes && (
                        <span style={{ color: '#854D0E', background: '#FEF9C3', padding: '1px 6px', fontSize: '11px' }}>
                          Nota: {activeAssigningRes.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target status indicator */}
                <div className="game-capacity-meter">
                  {staffSelectedTables.length === 0 ? (
                    <div style={{ color: '#D97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🟡 Nessun tavolo scelto (servono {activeAssigningRes.guests_count} posti)</span>
                    </div>
                  ) : calculateStaffCapacity() >= activeAssigningRes.guests_count ? (
                    <div style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={18} />
                      <span>Ottimo! {calculateStaffCapacity()} posti coperti (Tavoli: {staffSelectedTables.join(' + ')})</span>
                    </div>
                  ) : (
                    <div style={{ color: '#D97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🟡 {calculateStaffCapacity()} su {activeAssigningRes.guests_count} posti coperti - scegli il secondo tavolo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-TAP QUICK SELECTION CARDS (Logica Gioco) */}
              <div className="game-quick-options">
                <div className="game-options-title">
                  ⚡ 1 CLICK: SCEGLI DOVE FARLI SEDERE (PER {activeAssigningRes.guests_count} PERSONE):
                </div>

                <div className="game-cards-row">
                  {getAvailableOptionsForRes(activeAssigningRes).map((combo) => {
                    const isSelected =
                      combo.tables.every((t) => staffSelectedTables.includes(t)) &&
                      staffSelectedTables.length === combo.tables.length;
                    return (
                      <button
                        key={combo.id}
                        type="button"
                        onClick={() => applyCombo(combo)}
                        className={`game-combo-card ${isSelected ? 'active' : ''}`}
                      >
                        <div className="combo-card-tag">{combo.zone}</div>
                        <div className="combo-card-name">🍽️ {combo.label}</div>
                        <div className="combo-card-pax">
                          {combo.pax} posti {isSelected ? '✓ SELEZIONATO' : ''}
                        </div>
                      </button>
                    );
                  })}
                  {getAvailableOptionsForRes(activeAssigningRes).length === 0 && (
                    <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', padding: '6px 0' }}>
                      Nessuna combinazione rapida predefinita libera. Clicca sui tavoli verdi direttamente sulla piantina.
                    </div>
                  )}
                </div>
              </div>

              {/* MAP INSTRUCTION */}
              <div className="game-map-hint">
                📍 <em>Oppure tocca direttamente i <strong>tavoli verdi illuminati</strong> sulla planimetria sottostante:</em>
              </div>

              {/* ACTION CONFIRMATION BAR */}
              <div className="game-actions-bar">
                <button
                  type="button"
                  onClick={confirmAssignment}
                  disabled={!isReadyToConfirm()}
                  className="game-btn-confirm"
                >
                  <Check size={20} />
                  <span>
                    {isReadyToConfirm()
                      ? `CONFERMA E ASSEGNA ${staffSelectedTables.length === 3 ? 'TAVOLATA UNITA' : 'TAVOLO'} (${staffSelectedTables.join(' + ')})`
                      : staffSelectedTables.length === 0
                      ? `Seleziona i tavoli per coprire ${activeAssigningRes.guests_count} persone`
                      : `Seleziona ancora ${ (activeAssigningRes.guests_count <= 2 ? 1 : activeAssigningRes.guests_count <= 4 ? 2 : 3) - staffSelectedTables.length } tavolo/i per confermare`}
                  </span>
                </button>

                {staffSelectedTables.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStaffSelectedTables([])}
                    className="game-btn-clear"
                  >
                    Svuota selezione
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveAssigningRes(null);
                    setStaffSelectedTables([]);
                  }}
                  className="game-btn-cancel"
                >
                  Annulla
                </button>
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
            activeAssigningRes={activeAssigningRes}
            onConfirmAssignment={confirmAssignment}
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
