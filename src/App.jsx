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
  
  // Contact details & comprehensive special requests
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
      notes: notes,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reservations').insert([bookingData]);
        if (error) console.warn('Supabase notice:', error.message);
      }
      
      const updated = [bookingData, ...reservations];
      setReservations(updated);
      localStorage.setItem('pupi_reservations', JSON.stringify(updated));

      setConfirmedBooking(bookingData);
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FDB4BF', '#B5A642', '#333333']
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
      `SUMMARY:I Pupi Siciliani (${guests} ${t.guestLabel})`,
      `DESCRIPTION:Notes: ${notes || 'None'}`,
      'LOCATION:Vindegade 73, 5000 Odense C, Denmark',
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
    <div className="booking-section">
      <div className="booking-container">
        
        {/* Top Header Utilities: Language & View Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'client' ? (
              <>
                <button
                  type="button"
                  onClick={() => setClientLang('da')}
                  className={clientLang === 'da' ? 'gold-link' : ''}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '3px',
                    padding: '6px 14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🇩🇰 Dansk
                </button>
                <button
                  type="button"
                  onClick={() => setClientLang('en')}
                  className={clientLang === 'en' ? 'gold-link' : ''}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '3px',
                    padding: '6px 14px',
                    fontSize: '14px',
                    fontWeight: 700,
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
                  className={adminLang === 'it' ? 'gold-link' : ''}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '3px',
                    padding: '6px 14px',
                    fontSize: '14px',
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
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '3px',
                    padding: '6px 14px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🇬🇧 English
                </button>
              </>
            )}
          </div>

          {/* View Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('client')}
              style={{
                background: activeTab === 'client' ? '#333333' : '#FFFFFF',
                color: activeTab === 'client' ? '#FFFFFF' : '#333333',
                border: '1px solid #D1D5DB',
                borderRadius: '3px',
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {activeTab === 'client' ? t.viewBooking : 'Bordreservation / Booking'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              style={{
                background: activeTab === 'staff' ? '#333333' : '#FFFFFF',
                color: activeTab === 'staff' ? '#FFFFFF' : '#333333',
                border: '1px solid #D1D5DB',
                borderRadius: '3px',
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {activeTab === 'staff' ? t.viewStaff : '⚙︎ Staff / Admin'}
            </button>
          </div>
        </div>

        {/* Brand Header with DALI Font */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="brand-title" style={{ fontFamily: 'DALI, serif' }}>{t.title}</h1>
          <h2>{t.subtitle || t.desc}</h2>
        </header>

        {/* CLIENT FACING FLOW (Clean, No table selection, Clear requests/allergy box) */}
        {activeTab === 'client' && (
          <div className="booking-layout-grid">
            <main>
              {/* Stepper Tab Indicator */}
              <div className="spec-stepper">
                <button
                  type="button"
                  className={`spec-step-btn ${step === 1 ? 'active' : ''}`}
                  onClick={() => setStep(1)}
                >
                  {t.step1}
                </button>
                <span style={{ color: '#D1D5DB' }}>/</span>
                <button
                  type="button"
                  className={`spec-step-btn ${step === 2 ? 'active' : ''}`}
                  onClick={() => setStep(2)}
                >
                  {t.step2}
                </button>
              </div>

              {step === 1 && (
                <div className="booking-card">
                  <div style={{ marginBottom: '25px' }}>
                    <h3>{t.guestsTitle}</h3>
                    <p className="form-label-desc" style={{ marginTop: '6px' }}>{t.guestsDesc}</p>
                  </div>

                  <div className="form-group-stack">
                    {/* Guest Picker */}
                    <div className="form-group">
                      <label className="form-label">{t.summaryGuests}</label>
                      <div className="guest-selector-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            className={`guest-btn ${guests === num ? 'selected' : ''}`}
                            onClick={() => setGuests(num)}
                          >
                            {num}
                            <span className="sub">
                              {num === 10 ? t.groupLabel : num === 1 ? t.singleGuestLabel : t.guestLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Picker */}
                    <div className="form-group">
                      <label className="form-label">{t.dateLabel}</label>
                      <input
                        type="date"
                        className="booking-input"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="form-group">
                      <label className="form-label">{t.timeLabel}</label>
                      <div className="time-slot-grid">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot-btn ${time === slot ? 'selected' : ''}`}
                            onClick={() => setTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setStep(2)}
                      >
                        {t.btnProceed}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleBooking} className="booking-card">
                  <div style={{ marginBottom: '25px' }}>
                    <h3>{t.contactTitle}</h3>
                    <p className="form-label-desc" style={{ marginTop: '6px' }}>{t.contactDesc}</p>
                  </div>

                  <div className="form-group-stack">
                    <div className="form-group">
                      <label className="form-label">{t.nameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={t.namePlaceholder}
                        className="booking-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">{t.phoneLabel}</label>
                        <input
                          type="tel"
                          required
                          placeholder={t.phonePlaceholder}
                          className="booking-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t.emailLabel}</label>
                        <input
                          type="email"
                          required
                          placeholder={t.emailPlaceholder}
                          className="booking-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Special requests / allergies / high-chair / table comments box */}
                    <div className="form-group">
                      <label className="form-label">{t.notesLabel}</label>
                      <textarea
                        rows="4"
                        placeholder={t.notesPlaceholder}
                        className="booking-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <small style={{ color: 'var(--color-neutral-muted)', fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>
                        {t.notesHelp}
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setStep(1)}
                      >
                        {t.btnBack}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? t.btnSubmitting : t.btnConfirm}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </main>

            {/* Sidebar Summary */}
            <aside className="summary-spec-card">
              <h3 style={{ marginBottom: '16px' }}>{t.summaryTitle}</h3>

              <div className="summary-spec-item">
                <span className="label">{t.summaryGuests}</span>
                <span className="val">{guests} {t.guestLabel.toLowerCase()}</span>
              </div>

              <div className="summary-spec-item">
                <span className="label">{t.summaryDate}</span>
                <span className="val summary-accent-val">{formatDate(date)}</span>
              </div>

              <div className="summary-spec-item">
                <span className="label">{t.summaryTime}</span>
                <span className="val summary-accent-val">{time}</span>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--surface-section)', borderRadius: '3px', fontSize: '14px', lineHeight: 1.6 }}>
                <strong>I Pupi Siciliani</strong><br />
                Vindegade 73, 5000 Odense C<br />
                <span style={{ color: 'var(--color-accent-gold)', fontWeight: 700 }}>Tel: +45 66 11 16 96</span>
              </div>
            </aside>
          </div>
        )}

        {/* STAFF & MODULAR TABLE MANAGEMENT */}
        {activeTab === 'staff' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <div className="booking-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3>{t.title}</h3>
                  <p className="form-label-desc">{t.desc}</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'var(--surface-section)', border: '1px solid #D1D5DB', borderRadius: '3px', fontWeight: 700, fontSize: '14px' }}>
                  {t.selectedTables}: <span style={{ color: 'var(--color-accent-gold)' }}>{staffSelectedTables.map(t => `T${t}`).join(', ') || t.none}</span> ({calculateStaffCapacity()} {t.pax})
                </div>
              </div>

              {/* Quick Preset merges */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-neutral-muted)' }}>
                  {t.quickCombos}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {PRESET_COMBOS.map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => applyStaffCombo(combo)}
                      style={{
                        padding: '6px 14px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: '3px',
                        fontSize: '13px',
                        fontWeight: 700,
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
                selectedTables={staffSelectedTables}
                onToggleTable={toggleStaffTable}
                guests={calculateStaffCapacity()}
              />
            </div>

            {/* Reservations Table with Special Requests & Allergies clearly visible */}
            <div className="booking-card">
              <h3 style={{ marginBottom: '16px' }}>{t.reservationsTitle}</h3>
              {reservations.length === 0 ? (
                <p style={{ color: 'var(--color-neutral-muted)' }}>{t.noReservations}</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #D1D5DB', color: 'var(--color-neutral-muted)' }}>
                        <th style={{ padding: '12px 10px' }}>{t.thGuest}</th>
                        <th style={{ padding: '12px 10px' }}>{t.thGuestsCount}</th>
                        <th style={{ padding: '12px 10px' }}>{t.thDateTime}</th>
                        <th style={{ padding: '12px 10px' }}>{t.thNotes}</th>
                        <th style={{ padding: '12px 10px' }}>{t.thStatus}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((res, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <td style={{ padding: '14px 10px', fontWeight: 700 }}>
                            {res.customer_name}<br />
                            <small style={{ fontWeight: 400, color: 'var(--color-neutral-muted)' }}>{res.customer_phone}</small>
                          </td>
                          <td style={{ padding: '14px 10px' }}>{res.guests_count} {t.pax}</td>
                          <td style={{ padding: '14px 10px' }}>{res.booking_date} {res.booking_time}</td>
                          <td style={{ padding: '14px 10px', maxWidth: '320px', color: res.notes ? '#333333' : 'var(--color-neutral-muted)' }}>
                            {res.notes ? (
                              <span style={{ background: '#FFF5F6', padding: '4px 8px', borderRadius: '3px', border: '1px solid #FDB4BF', display: 'inline-block' }}>
                                {res.notes}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '14px 10px' }}>
                            <span style={{ padding: '4px 8px', background: 'var(--surface-section)', border: '1px solid #D1D5DB', borderRadius: '3px', fontSize: '12px', fontWeight: 700 }}>
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

        {/* Modal Dialog */}
        {confirmedBooking && (
          <div className="spec-modal-overlay">
            <div className="spec-modal-box">
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>{t.modalTitle}</h2>
              <p style={{ color: 'var(--color-neutral-muted)', marginBottom: '24px' }}>
                {t.modalThanks} <strong>{confirmedBooking.customer_name}</strong>. {t.modalSub}{' '}
                <strong>{formatDate(date)}</strong> {t.summaryTime.toLowerCase()} <strong>{time}</strong>.
              </p>

              <div style={{ backgroundColor: 'var(--surface-section)', border: '1px solid #D1D5DB', borderRadius: '3px', padding: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '14px' }}>
                <div><strong>{t.modalGuests}:</strong> {confirmedBooking.guests_count}</div>
                {confirmedBooking.notes && <div><strong>{t.modalNotes}:</strong> {confirmedBooking.notes}</div>}
                <div><strong>{t.modalEmailSent}:</strong> {confirmedBooking.customer_email}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={downloadICS}
                >
                  {t.btnCalendar}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1 }}
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
    </div>
  );
}
