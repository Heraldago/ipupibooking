import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES, PRESET_COMBOS } from './components/TablePlan';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import confetti from 'canvas-confetti';

const TIME_SLOTS = [
  '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
];

export default function App() {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:30');
  const [selectedTables, setSelectedTables] = useState(['2']);
  
  // Contact details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // Submission & modal state
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Auto-adjust selected tables when guest count changes
  useEffect(() => {
    if (guests <= 2) {
      if (selectedTables.length !== 1) setSelectedTables(['2']);
    } else if (guests <= 4) {
      setSelectedTables(['2', '3']);
    } else if (guests <= 6) {
      setSelectedTables(['9', '10', '11']);
    } else {
      setSelectedTables(['4', '5', '6']);
    }
  }, [guests]);

  const toggleTable = (id) => {
    if (selectedTables.includes(id)) {
      if (selectedTables.length === 1) return; // Keep at least one
      setSelectedTables(selectedTables.filter((t) => t !== id));
    } else {
      setSelectedTables([...selectedTables, id]);
    }
  };

  const applyCombo = (combo) => {
    setSelectedTables(combo.tables);
  };

  const calculateCapacity = () => {
    return selectedTables.reduce((acc, tid) => {
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
      table_ids: selectedTables,
      table_summary: `Tavoli: ${selectedTables.join(', ')} (${calculateCapacity()} posti)`,
      notes: notes,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reservations').insert([bookingData]);
        if (error) console.warn('Supabase sync notice:', error.message);
      } else {
        // Local persistence fallback
        const existing = JSON.parse(localStorage.getItem('pupi_reservations') || '[]');
        existing.push(bookingData);
        localStorage.setItem('pupi_reservations', JSON.stringify(existing));
      }

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
      `SUMMARY:Cena a I Pupi Siciliani (${confirmedBooking.table_summary})`,
      `DESCRIPTION:Prenotazione per ${guests} ospiti. Note: ${notes || 'Nessuna'}`,
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
      {/* Brand Header */}
      <header className="brand-header">
        <div className="brand-badge">Trattoria Autentica • Odense</div>
        <h1 className="brand-title">I Pupi Siciliani</h1>
        <p className="brand-subtitle">
          Sapori autentici della Sicilia nel cuore di Odense. Scegli il tuo tavolo ideale e prenota online in pochi istanti.
        </p>
      </header>

      {/* Modern Stepper */}
      <nav className="stepper-nav">
        <button
          className={`step-indicator ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}
          onClick={() => setStep(1)}
        >
          <span className="step-number">1</span> Data & Ospiti
        </button>
        <button
          className={`step-indicator ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}
          onClick={() => setStep(2)}
        >
          <span className="step-number">2</span> Scegli il Tavolo
        </button>
        <button
          className={`step-indicator ${step === 3 ? 'active' : ''}`}
          onClick={() => setStep(3)}
        >
          <span className="step-number">3</span> I Tuoi Dettagli
        </button>
      </nav>

      {/* Main Grid: Left Flow + Right Sticky Summary */}
      <div className="booking-grid">
        <main>
          {step === 1 && (
            <div className="lux-card">
              <div className="card-heading">
                <h2 className="card-title">Quanti sarete al tavolo?</h2>
                <p className="card-desc">Seleziona il numero di coperti per visualizzare i tavoli adatti</p>
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
                <label className="form-label">Data della visita</label>
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

              <button
                type="button"
                className="cta-button"
                onClick={() => setStep(2)}
              >
                Continua e Scegli il Tavolo →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="lux-card">
              <div className="card-heading">
                <h2 className="card-title">Mappa dei Tavoli</h2>
                <p className="card-desc">
                  Clicca sui tavoli per selezionarli o unirli a tuo piacimento.
                </p>
              </div>

              {/* Quick Combinations presets */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Disposizioni modulari consigliate:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {PRESET_COMBOS.map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => applyCombo(combo)}
                      style={{
                        padding: '6px 14px',
                        background: '#FAF2EE',
                        border: '1px solid rgba(194,112,96,0.3)',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
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

              {/* Floor Plan */}
              <TablePlan
                selectedTables={selectedTables}
                onToggleTable={toggleTable}
                guests={guests}
              />

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
                  type="button"
                  className="cta-button"
                  onClick={() => setStep(3)}
                >
                  Conferma Tavolo e Dati →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleBooking} className="lux-card">
              <div className="card-heading">
                <h2 className="card-title">Dati di Contatto</h2>
                <p className="card-desc">Completa la prenotazione per ricevere conferma immediata</p>
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
                  <label className="form-label">Telefono *</label>
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
                  <label className="form-label">Email *</label>
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
                <label className="form-label">Note speciali o intolleranze (opzionale)</label>
                <textarea
                  rows="3"
                  placeholder="Compleanno, tavolo vicino alla finestra, allergie..."
                  className="lux-input"
                  style={{ height: 'auto', padding: '14px 18px' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="cta-button"
                  style={{ background: '#FAF2EE', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                  onClick={() => setStep(2)}
                >
                  ← Indietro
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cta-button"
                >
                  {loading ? 'Conferma in corso...' : 'Completa la Prenotazione ✓'}
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
            <span className="label">Tavoli Selezionati</span>
            <span className="value" style={{ color: 'var(--accent-rose)' }}>
              {selectedTables.map((t) => `T${t}`).join(', ')}
            </span>
          </div>

          <div className="summary-item">
            <span className="label">Capienza Tavoli</span>
            <span className="value">{calculateCapacity()} posti</span>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-rose-soft)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ✦ <strong>I Pupi Siciliani</strong><br />
            Vindegade 71, 5000 Odense C<br />
            Tel: +45 66 12 11 00
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-badge">✓</div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Prenotazione Confermata!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Grazie {confirmedBooking.customer_name}, ti aspettiamo il{' '}
              <strong>{new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</strong> alle{' '}
              <strong>{time}</strong>.
            </p>

            <div style={{ background: '#FAF2EE', padding: '16px', borderRadius: '14px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Tavolo:</strong> {confirmedBooking.table_summary}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}><strong>Ospiti:</strong> {confirmedBooking.guests_count} persone</div>
              <div style={{ fontSize: '0.9rem' }}><strong>Email di conferma:</strong> {confirmedBooking.customer_email}</div>
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
