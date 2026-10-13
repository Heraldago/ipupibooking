import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES, PRESET_COMBOS } from './components/TablePlan';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import confetti from 'canvas-confetti';

const TIME_SLOTS = [
  '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
];

const SEATING_PREFERENCES = [
  { id: 'any', label: 'Nessuna preferenza', desc: 'Assegnazione automatica del miglior tavolo' },
  { id: 'windows', label: 'Finestre su Vindegade', desc: 'Tavoli vista strada luminosi' },
  { id: 'main', label: 'Sala Principale', desc: 'Atmosfera centrale accogliente' },
  { id: 'saletta', label: 'Saletta Riservata', desc: 'Ambiente intimo o tavolate private' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'staff'
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:30');
  const [preference, setPreference] = useState('any');
  
  // Contact details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Submission & modal state
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Staff state (modular floor plan)
  const [staffSelectedTables, setStaffSelectedTables] = useState(['2', '3']);
  const [reservations, setReservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pupi_reservations') || '[]');
    } catch {
      return [];
    }
  });

  const loadReservations = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setReservations(data);
      }
    }
  };

  useEffect(() => {
    loadReservations();
  }, [activeTab]);

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
      const t = TABLES.find((item) => item.id === tid);
      return acc + (t ? t.pax : 2);
    }, 0);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bookingData = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      booking_date: date,
      booking_time: time,
      guests_count: guests,
      preference_area: SEATING_PREFERENCES.find(p => p.id === preference)?.label || 'Indifferente',
      notes: notes,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reservations').insert([bookingData]);
        if (error) console.warn('Supabase sync notice:', error.message);
      }
      
      const updated = [bookingData, ...reservations];
      setReservations(updated);
      localStorage.setItem('pupi_reservations', JSON.stringify(updated));

      setConfirmedBooking(bookingData);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C27060', '#24140E', '#FAF2EE']
      });
    } catch (err) {
      console.error(err);
      alert('Si è verificato un errore, riprova.');
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = () => {
    if (!confirmedBooking) return;
    const startIso = `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//I Pupi Siciliani//Booking System//IT',
      'BEGIN:VEVENT',
      `SUMMARY:Cena a I Pupi Siciliani (${guests} persone)`,
      `DESCRIPTION:Zona richiesta: ${confirmedBooking.preference_area}. Note: ${notes || 'Nessuna'}`,
      'LOCATION:Vindegade 71, 5000 Odense C, Danimarca',
      `DTSTART:${startIso}`,
      `DTEND:${startIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prenotazione-ipupi-${date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      {/* Top Bar with View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{
          background: 'var(--bg-white)',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid var(--border-light)',
          display: 'inline-flex',
          gap: '4px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: 'none',
              background: activeTab === 'client' ? 'var(--accent-espresso)' : 'transparent',
              color: activeTab === 'client' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Prenotazione Tavolo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: 'none',
              background: activeTab === 'staff' ? 'var(--accent-espresso)' : 'transparent',
              color: activeTab === 'staff' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ⚙︎ Gestione Sala Staff
          </button>
        </div>
      </div>

      {/* Brand Header */}
      <header className="brand-header">
        <div className="brand-badge">Trattoria Autentica • Odense</div>
        <h1 className="brand-title">I Pupi Siciliani</h1>
        <p className="brand-subtitle">
          {activeTab === 'client' 
            ? 'Cucina tradizionale siciliana e calda accoglienza a Vindegade. Riserva il tuo posto con pochi click.'
            : 'Pannello di controllo interno per gestione tavoli modulari e capienze.'}
        </p>
      </header>

      {/* CLIENT FACING FLOW (Clean, No modular complexity) */}
      {activeTab === 'client' && (
        <>
          {/* Stepper */}
          <nav className="stepper-nav">
            <button
              className={`step-indicator ${step === 1 ? 'active' : 'done'}`}
              onClick={() => setStep(1)}
            >
              <span className="step-number">1</span> Dettagli Prenotazione
            </button>
            <button
              className={`step-indicator ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
            >
              <span className="step-number">2</span> Dati & Richieste
            </button>
          </nav>

          <div className="booking-grid">
            <main>
              {step === 1 && (
                <div className="lux-card">
                  <div className="card-heading">
                    <h2 className="card-title">Quanti ospiti sarete?</h2>
                    <p className="card-desc">Scegli il numero di persone per preparare la sala</p>
                  </div>

                  {/* Big Guest Picker */}
                  <div className="guest-picker">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`guest-btn ${guests === num ? 'selected' : ''}`}
                        onClick={() => setGuests(num)}
                      >
                        {num}
                        <span className="label">{num === 10 ? 'Gruppo' : num === 1 ? 'Persona' : 'Ospiti'}</span>
                      </button>
                    ))}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Data desiderata</label>
                    <input
                      type="date"
                      className="lux-input"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Orario preferito</label>
                    <div className="time-grid">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-btn ${time === slot ? 'selected' : ''}`}
                          onClick={() => setTime(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '28px' }}>
                    <label className="form-label">Zona o posizione preferita (opzionale)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {SEATING_PREFERENCES.map((pref) => (
                        <div
                          key={pref.id}
                          onClick={() => setPreference(pref.id)}
                          style={{
                            padding: '16px',
                            background: preference === pref.id ? 'var(--bg-rose-card)' : 'var(--bg-white)',
                            border: `1.5px solid ${preference === pref.id ? 'var(--accent-rose)' : 'var(--border-light)'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
                            {pref.label}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {pref.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cta-button"
                    style={{ marginTop: '32px' }}
                    onClick={() => setStep(2)}
                  >
                    Procedi con i Tuoi Dati →
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleBooking} className="lux-card">
                  <div className="card-heading">
                    <h2 className="card-title">Dati di Contatto & Richieste</h2>
                    <p className="card-desc">Inserisci i tuoi recapiti e qualsiasi richiesta speciale per il tavolo</p>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Nome e Cognome *</label>
                    <input
                      type="text"
                      required
                      placeholder="es. Mario Rossi"
                      className="lux-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-field">
                      <label className="form-label">Numero di Telefono *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+45 12 34 56 78"
                        className="lux-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Indirizzo Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="nome@esempio.it"
                        className="lux-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Richieste speciali o posizione specifica</label>
                    <textarea
                      rows="3"
                      placeholder="Es. Vorremmo un tavolo appartato, festeggiamo un compleanno, seggiolino per bambini..."
                      className="lux-input"
                      style={{ height: 'auto', padding: '16px 18px', lineHeight: 1.4 }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
                      Faremo il possibile per soddisfare la tua richiesta in base alla disponibilità della sala.
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button
                      type="button"
                      className="cta-button"
                      style={{ background: '#FAF2EE', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      onClick={() => setStep(1)}
                    >
                      ← Indietro
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="cta-button"
                    >
                      {loading ? 'Conferma in corso...' : 'Conferma la Prenotazione ✓'}
                    </button>
                  </div>
                </form>
              )}
            </main>

            {/* Right Sticky Summary */}
            <aside className="summary-card">
              <h3 className="summary-heading">Riepilogo</h3>

              <div className="summary-item">
                <span className="label">Ospiti</span>
                <span className="value">{guests} persone</span>
              </div>

              <div className="summary-item">
                <span className="label">Data</span>
                <span className="value">{new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="summary-item">
                <span className="label">Orario</span>
                <span className="value">{time}</span>
              </div>

              <div className="summary-item">
                <span className="label">Zona</span>
                <span className="value" style={{ color: 'var(--accent-rose)' }}>
                  {SEATING_PREFERENCES.find(p => p.id === preference)?.label}
                </span>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-rose-soft)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ✦ <strong>I Pupi Siciliani</strong><br />
                Vindegade 71, 5000 Odense C<br />
                Tel: +45 66 12 11 00
              </div>
            </aside>
          </div>
        </>
      )}

      {/* STAFF / INTERNAL MANAGEMENT (Where modular floor plan lives!) */}
      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <div className="lux-card">
            <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="card-title">Gestione Sala & Tavoli Modulari</h2>
                <p className="card-desc">
                  Configura e unisci i tavoli per gestire la capienza, i grupponi e le prenotazioni in arrivo.
                </p>
              </div>
              <div style={{ background: '#FAF2EE', padding: '10px 18px', borderRadius: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                Tavoli selezionati: <span style={{ color: 'var(--accent-rose)' }}>{staffSelectedTables.map(t => `T${t}`).join(', ') || 'Nessuno'}</span> ({calculateStaffCapacity()} pax)
              </div>
            </div>

            {/* Modular Combinations presets for staff */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Unioni veloci sala & saletta:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {PRESET_COMBOS.map((combo) => (
                  <button
                    key={combo.id}
                    type="button"
                    onClick={() => applyStaffCombo(combo)}
                    style={{
                      padding: '8px 16px',
                      background: '#FAF2EE',
                      border: '1.5px solid rgba(194,112,96,0.3)',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-dark)',
                      cursor: 'pointer'
                    }}
                  >
                    {combo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Floor Plan */}
            <TablePlan
              selectedTables={staffSelectedTables}
              onToggleTable={toggleStaffTable}
              guests={calculateStaffCapacity()}
            />
          </div>

          {/* Incoming Reservations Table */}
          <div className="lux-card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Prenotazioni Ricevute</h2>
            {reservations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nessuna prenotazione memorizzata al momento.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 10px' }}>Ospite</th>
                      <th style={{ padding: '12px 10px' }}>Coperti</th>
                      <th style={{ padding: '12px 10px' }}>Data & Ora</th>
                      <th style={{ padding: '12px 10px' }}>Zona Preferita</th>
                      <th style={{ padding: '12px 10px' }}>Note / Richieste</th>
                      <th style={{ padding: '12px 10px' }}>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(61, 35, 25, 0.08)' }}>
                        <td style={{ padding: '14px 10px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {res.customer_name}<br />
                          <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{res.customer_phone}</small>
                        </td>
                        <td style={{ padding: '14px 10px' }}>{res.guests_count} pax</td>
                        <td style={{ padding: '14px 10px' }}>{res.booking_date} alle {res.booking_time}</td>
                        <td style={{ padding: '14px 10px', color: 'var(--accent-rose)', fontWeight: 500 }}>
                          {res.preference_area || 'Indifferente'}
                        </td>
                        <td style={{ padding: '14px 10px', maxWidth: '280px', color: res.notes ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                          {res.notes || '—'}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{ padding: '4px 10px', background: '#FAF2EE', color: 'var(--accent-rose)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {res.status || 'Confermata'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-badge">✓</div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Prenotazione Ricevuta!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Grazie {confirmedBooking.customer_name}, la tua prenotazione per{' '}
              <strong>{new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</strong> alle{' '}
              <strong>{time}</strong> è confermata.
            </p>

            <div style={{ background: '#FAF2EE', padding: '16px', borderRadius: '14px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Ospiti:</strong> {confirmedBooking.guests_count} persone</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Preferenza:</strong> {confirmedBooking.preference_area}</div>
              {confirmedBooking.notes && (
                <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>Note:</strong> {confirmedBooking.notes}</div>
              )}
              <div style={{ fontSize: '0.9rem' }}><strong>Email inviata a:</strong> {confirmedBooking.customer_email}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="cta-button"
                style={{ background: '#FAF2EE', color: 'var(--text-dark)' }}
                onClick={downloadICS}
              >
                📅 Salva in Calendario
              </button>
              <button
                type="button"
                className="cta-button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setStep(1);
                }}
              >
                Nuova Prenotazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
