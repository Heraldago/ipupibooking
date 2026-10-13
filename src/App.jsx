import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES, PRESET_COMBOS } from './components/TablePlan';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { clientTranslations, adminTranslations } from './i18n';
import confetti from 'canvas-confetti';

const TIME_SLOTS = [
  '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'staff'
  const [clientLang, setClientLang] = useState('da');   // 'da' | 'en'
  const [adminLang, setAdminLang] = useState('it');     // 'it' | 'en'

  const t = activeTab === 'client' ? clientTranslations[clientLang] : adminTranslations[adminLang];

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

    const prefLabel = t.preferences ? t.preferences[preference]?.label : preference;

    const bookingData = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      booking_date: date,
      booking_time: time,
      guests_count: guests,
      preference_area: prefLabel,
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
      alert('Error occurred, please try again.');
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
      'PRODID:-//I Pupi Siciliani//Booking System//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dinner at I Pupi Siciliani (${guests} guests)`,
      `DESCRIPTION:Area: ${confirmedBooking.preference_area}. Notes: ${notes || 'None'}`,
      'LOCATION:Vindegade 71, 5000 Odense C, Denmark',
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
    a.download = `ipupi-reservation-${date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (isoDate) => {
    const locale = clientLang === 'da' ? 'da-DK' : 'en-GB';
    return new Date(isoDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="app-layout">
      {/* Top Header Controls: Language Switcher + View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Language Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {activeTab === 'client' ? (
            <>
              <button
                type="button"
                onClick={() => setClientLang('da')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${clientLang === 'da' ? 'var(--accent-espresso)' : 'var(--border-light)'}`,
                  background: clientLang === 'da' ? 'var(--accent-espresso)' : 'var(--bg-white)',
                  color: clientLang === 'da' ? '#FFFFFF' : 'var(--text-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🇩🇰 Dansk
              </button>
              <button
                type="button"
                onClick={() => setClientLang('en')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${clientLang === 'en' ? 'var(--accent-espresso)' : 'var(--border-light)'}`,
                  background: clientLang === 'en' ? 'var(--accent-espresso)' : 'var(--bg-white)',
                  color: clientLang === 'en' ? '#FFFFFF' : 'var(--text-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🇬🇧 English
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAdminLang('it')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${adminLang === 'it' ? 'var(--accent-espresso)' : 'var(--border-light)'}`,
                  background: adminLang === 'it' ? 'var(--accent-espresso)' : 'var(--bg-white)',
                  color: adminLang === 'it' ? '#FFFFFF' : 'var(--text-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🇮🇹 Italiano
              </button>
              <button
                type="button"
                onClick={() => setAdminLang('en')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1.5px solid ${adminLang === 'en' ? 'var(--accent-espresso)' : 'var(--border-light)'}`,
                  background: adminLang === 'en' ? 'var(--accent-espresso)' : 'var(--bg-white)',
                  color: adminLang === 'en' ? '#FFFFFF' : 'var(--text-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🇬🇧 English
              </button>
            </>
          )}
        </div>

        {/* View Switcher */}
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
              padding: '8px 18px',
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
            {activeTab === 'client' ? t.viewBooking : 'Bordreservation / Booking'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            style={{
              padding: '8px 18px',
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
            {activeTab === 'staff' ? t.viewStaff : '⚙︎ Staff / Admin'}
          </button>
        </div>
      </div>

      {/* Brand Header */}
      <header className="brand-header">
        <div className="brand-badge">{t.badge || 'Trattoria Autentica • Odense'}</div>
        <h1 className="brand-title">I Pupi Siciliani</h1>
        <p className="brand-subtitle">{t.subtitle || t.desc}</p>
      </header>

      {/* CLIENT FACING FLOW (Danish / English) */}
      {activeTab === 'client' && (
        <>
          <nav className="stepper-nav">
            <button
              className={`step-indicator ${step === 1 ? 'active' : 'done'}`}
              onClick={() => setStep(1)}
            >
              {t.step1}
            </button>
            <button
              className={`step-indicator ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
            >
              {t.step2}
            </button>
          </nav>

          <div className="booking-grid">
            <main>
              {step === 1 && (
                <div className="lux-card">
                  <div className="card-heading">
                    <h2 className="card-title">{t.guestsTitle}</h2>
                    <p className="card-desc">{t.guestsDesc}</p>
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
                        <span className="label">
                          {num === 10 ? t.groupLabel : num === 1 ? t.singleGuestLabel : t.guestLabel}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t.dateLabel}</label>
                    <input
                      type="date"
                      className="lux-input"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t.timeLabel}</label>
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
                    <label className="form-label">{t.preferenceLabel}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {Object.entries(t.preferences).map(([key, val]) => (
                        <div
                          key={key}
                          onClick={() => setPreference(key)}
                          style={{
                            padding: '16px',
                            background: preference === key ? 'var(--bg-rose-card)' : 'var(--bg-white)',
                            border: `1.5px solid ${preference === key ? 'var(--accent-rose)' : 'var(--border-light)'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
                            {val.label}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {val.desc}
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
                    {t.btnProceed}
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleBooking} className="lux-card">
                  <div className="card-heading">
                    <h2 className="card-title">{t.contactTitle}</h2>
                    <p className="card-desc">{t.contactDesc}</p>
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t.nameLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      className="lux-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-field">
                      <label className="form-label">{t.phoneLabel}</label>
                      <input
                        type="tel"
                        required
                        placeholder={t.phonePlaceholder}
                        className="lux-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">{t.emailLabel}</label>
                      <input
                        type="email"
                        required
                        placeholder={t.emailPlaceholder}
                        className="lux-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">{t.notesLabel}</label>
                    <textarea
                      rows="3"
                      placeholder={t.notesPlaceholder}
                      className="lux-input"
                      style={{ height: 'auto', padding: '16px 18px', lineHeight: 1.4 }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
                      {t.notesHelp}
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button
                      type="button"
                      className="cta-button"
                      style={{ background: '#FAF2EE', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}
                      onClick={() => setStep(1)}
                    >
                      {t.btnBack}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="cta-button"
                    >
                      {loading ? t.btnSubmitting : t.btnConfirm}
                    </button>
                  </div>
                </form>
              )}
            </main>

            {/* Right Summary */}
            <aside className="summary-card">
              <h3 className="summary-heading">{t.summaryTitle}</h3>

              <div className="summary-item">
                <span className="label">{t.summaryGuests}</span>
                <span className="value">{guests} {t.guestLabel.toLowerCase()}</span>
              </div>

              <div className="summary-item">
                <span className="label">{t.summaryDate}</span>
                <span className="value">{formatDate(date)}</span>
              </div>

              <div className="summary-item">
                <span className="label">{t.summaryTime}</span>
                <span className="value">{time}</span>
              </div>

              <div className="summary-item">
                <span className="label">{t.summaryArea}</span>
                <span className="value" style={{ color: 'var(--accent-rose)' }}>
                  {t.preferences[preference]?.label}
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

      {/* STAFF / ADMIN VIEW (Italian / English) */}
      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <div className="lux-card">
            <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="card-title">{t.title}</h2>
                <p className="card-desc">{t.desc}</p>
              </div>
              <div style={{ background: '#FAF2EE', padding: '10px 18px', borderRadius: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                {t.selectedTables}: <span style={{ color: 'var(--accent-rose)' }}>{staffSelectedTables.map(t => `T${t}`).join(', ') || t.none}</span> ({calculateStaffCapacity()} {t.pax})
              </div>
            </div>

            {/* Modular Combinations presets for staff */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {t.quickCombos}
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
            <h2 className="card-title" style={{ marginBottom: '16px' }}>{t.reservationsTitle}</h2>
            {reservations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t.noReservations}</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 10px' }}>{t.thGuest}</th>
                      <th style={{ padding: '12px 10px' }}>{t.thGuestsCount}</th>
                      <th style={{ padding: '12px 10px' }}>{t.thDateTime}</th>
                      <th style={{ padding: '12px 10px' }}>{t.thArea}</th>
                      <th style={{ padding: '12px 10px' }}>{t.thNotes}</th>
                      <th style={{ padding: '12px 10px' }}>{t.thStatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(61, 35, 25, 0.08)' }}>
                        <td style={{ padding: '14px 10px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {res.customer_name}<br />
                          <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{res.customer_phone}</small>
                        </td>
                        <td style={{ padding: '14px 10px' }}>{res.guests_count} {t.pax}</td>
                        <td style={{ padding: '14px 10px' }}>{res.booking_date} {res.booking_time}</td>
                        <td style={{ padding: '14px 10px', color: 'var(--accent-rose)', fontWeight: 500 }}>
                          {res.preference_area || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', maxWidth: '280px', color: res.notes ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                          {res.notes || '—'}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{ padding: '4px 10px', background: '#FAF2EE', color: 'var(--accent-rose)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {res.status || t.statusConfirmed}
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
            <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{t.modalTitle}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              {t.modalThanks} <strong>{confirmedBooking.customer_name}</strong>. {t.modalSub}{' '}
              <strong>{formatDate(date)}</strong> {t.summaryTime.toLowerCase()} <strong>{time}</strong>.
            </p>

            <div style={{ background: '#FAF2EE', padding: '16px', borderRadius: '14px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>{t.modalGuests}:</strong> {confirmedBooking.guests_count}</div>
              <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>{t.modalArea}:</strong> {confirmedBooking.preference_area}</div>
              {confirmedBooking.notes && (
                <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}><strong>{t.modalNotes}:</strong> {confirmedBooking.notes}</div>
              )}
              <div style={{ fontSize: '0.9rem' }}><strong>{t.modalEmailSent}:</strong> {confirmedBooking.customer_email}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="cta-button"
                style={{ background: '#FAF2EE', color: 'var(--text-dark)' }}
                onClick={downloadICS}
              >
                {t.btnCalendar}
              </button>
              <button
                type="button"
                className="cta-button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setStep(1);
                }}
              >
                {t.btnNewBooking}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
