import React, { useState, useEffect } from 'react';
import TablePlan, { TABLES, PRESET_COMBOS } from './components/TablePlan';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { clientTranslations, adminTranslations } from './i18n';
import confetti from 'canvas-confetti';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Utensils 
} from 'lucide-react';

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

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getFridayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (isoDate) => {
    const locale = clientLang === 'da' ? 'da-DK' : 'en-GB';
    return new Date(isoDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatFullDate = (isoDate) => {
    if (!isoDate) return '';
    try {
      const locale = clientLang === 'da' ? 'da-DK' : 'en-GB';
      const parsed = new Date(isoDate + 'T00:00:00');
      const dayName = parsed.toLocaleDateString(locale, { weekday: 'long' });
      const dateFormatted = parsed.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dateFormatted}`;
    } catch {
      return formatDate(isoDate);
    }
  };

  return (
    <div className="booking-section">
      <div className="booking-container">
        
        {/* Top Header Utilities: Language & View Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'client' ? (
              <>
                <button
                  type="button"
                  onClick={() => setClientLang('da')}
                  className={clientLang === 'da' ? 'gold-link' : ''}
                  style={{
                    background: clientLang === 'da' ? '#FAF6F4' : '#FFFFFF',
                    border: '1.5px solid ' + (clientLang === 'da' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
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
                    background: clientLang === 'en' ? '#FAF6F4' : '#FFFFFF',
                    border: '1.5px solid ' + (clientLang === 'en' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
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
                    background: adminLang === 'it' ? '#FAF6F4' : '#FFFFFF',
                    border: '1.5px solid ' + (adminLang === 'it' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                    borderRadius: '8px',
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
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
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
                background: activeTab === 'client' ? '#1C1917' : '#FFFFFF',
                color: activeTab === 'client' ? '#FFFFFF' : '#1C1917',
                border: '1.5px solid ' + (activeTab === 'client' ? '#1C1917' : 'var(--color-neutral-border)'),
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
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
                background: activeTab === 'staff' ? '#1C1917' : '#FFFFFF',
                color: activeTab === 'staff' ? '#FFFFFF' : '#1C1917',
                border: '1.5px solid ' + (activeTab === 'staff' ? '#1C1917' : 'var(--color-neutral-border)'),
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {activeTab === 'staff' ? t.viewStaff : '⚙︎ Staff / Admin'}
            </button>
          </div>
        </div>

        {/* Brand Header with DALI Font */}
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 className="brand-title" style={{ fontFamily: 'DALI, serif' }}>{t.title}</h1>
          <h2 style={{ maxWidth: '640px', margin: '0 auto', fontSize: '15px' }}>{t.subtitle || t.desc}</h2>
        </header>

        {/* CLIENT FACING FLOW (Clean, Equal Height, Modern UX) */}
        {activeTab === 'client' && (
          <div>
            {/* Stepper Tab Indicator - placed cleanly above the grid */}
            <div className="booking-stepper-row">
              <div className="spec-stepper">
                <button
                  type="button"
                  className={`spec-step-btn ${step === 1 ? 'active' : ''}`}
                  onClick={() => setStep(1)}
                >
                  <span className="spec-step-num">1</span>
                  <span>{t.step1}</span>
                </button>
                <button
                  type="button"
                  className={`spec-step-btn ${step === 2 ? 'active' : ''}`}
                  onClick={() => setStep(2)}
                >
                  <span className="spec-step-num">2</span>
                  <span>{t.step2}</span>
                </button>
              </div>
            </div>

            <div className="booking-layout-grid">
              <main className="booking-main-col">
                {step === 1 && (
                  <div className="booking-card">
                    <div>
                      <div style={{ marginBottom: '20px' }}>
                        <h3>{t.guestsTitle}</h3>
                        <p className="form-label-desc" style={{ marginTop: '4px' }}>{t.guestsDesc}</p>
                      </div>

                      <div className="form-group-stack">
                        {/* Guest Picker */}
                        <div className="form-group">
                          <label className="form-label">
                            <Users size={18} color="var(--color-accent-gold)" />
                            {t.summaryGuests}
                          </label>
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
                          {guests >= 10 && (
                            <p style={{ fontSize: '13px', color: '#7A6F24', background: 'rgba(181, 166, 66, 0.12)', padding: '8px 12px', borderRadius: '8px', marginTop: '4px' }}>
                              {t.groupAlert}
                            </p>
                          )}
                        </div>

                        {/* Date Picker */}
                        <div className="form-group">
                          <label className="form-label">
                            <Calendar size={18} color="var(--color-accent-gold)" />
                            {t.dateLabel}
                          </label>
                          
                          {/* Quick date chips */}
                          <div className="date-quick-chips">
                            <button
                              type="button"
                              className={`date-chip-btn ${date === getTodayStr() ? 'active' : ''}`}
                              onClick={() => setDate(getTodayStr())}
                            >
                              {t.today}
                            </button>
                            <button
                              type="button"
                              className={`date-chip-btn ${date === getTomorrowStr() ? 'active' : ''}`}
                              onClick={() => setDate(getTomorrowStr())}
                            >
                              {t.tomorrow}
                            </button>
                            <button
                              type="button"
                              className={`date-chip-btn ${date === getFridayStr() ? 'active' : ''}`}
                              onClick={() => setDate(getFridayStr())}
                            >
                              {t.thisFriday}
                            </button>
                          </div>

                          <div className="date-input-wrapper">
                            <span className="date-input-icon">
                              <Calendar size={18} />
                            </span>
                            <input
                              type="date"
                              className="booking-input with-icon"
                              value={date}
                              min={getTodayStr()}
                              onChange={(e) => setDate(e.target.value)}
                            />
                          </div>

                          <div className="date-preview-pill">
                            <Calendar size={14} />
                            <span>{formatFullDate(date)}</span>
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="form-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <label className="form-label">
                              <Clock size={18} color="var(--color-accent-gold)" />
                              {t.timeLabel}
                            </label>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-muted)' }}>
                              {t.eveningService}
                            </span>
                          </div>

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
                      </div>
                    </div>

                    <div style={{ marginTop: '28px' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setStep(2)}
                      >
                        <span>{t.btnProceed}</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleBooking} className="booking-card">
                    <div>
                      <div style={{ marginBottom: '20px' }}>
                        <h3>{t.contactTitle}</h3>
                        <p className="form-label-desc" style={{ marginTop: '4px' }}>{t.contactDesc}</p>
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
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft size={16} />
                        <span>{t.btnBack}</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ flex: 1 }}
                      >
                        <span>{loading ? t.btnSubmitting : t.btnConfirm}</span>
                      </button>
                    </div>
                  </form>
                )}
              </main>

              {/* Sidebar Summary - Equal Height */}
              <aside className="summary-spec-card">
                <div>
                  <div className="summary-spec-header">
                    <h3 style={{ fontSize: '20px', margin: 0 }}>{t.summaryTitle}</h3>
                    <span className="summary-badge">I Pupi</span>
                  </div>

                  <div className="summary-spec-item">
                    <span className="label-group">
                      <Users size={18} color="var(--color-accent-gold)" />
                      <span>{t.summaryGuests}</span>
                    </span>
                    <span className="val">
                      {guests} {guests === 1 ? t.singleGuestLabel.toLowerCase() : t.guestLabel.toLowerCase()}
                    </span>
                  </div>

                  <div className="summary-spec-item">
                    <span className="label-group">
                      <Calendar size={18} color="var(--color-accent-gold)" />
                      <span>{t.summaryDate}</span>
                    </span>
                    <span className="val summary-accent-val">{formatDate(date)}</span>
                  </div>

                  <div className="summary-spec-item">
                    <span className="label-group">
                      <Clock size={18} color="var(--color-accent-gold)" />
                      <span>{t.summaryTime}</span>
                    </span>
                    <span className="val summary-accent-val">{time}</span>
                  </div>

                  {/* Trust guarantees */}
                  <div className="summary-trust-box">
                    <div className="summary-trust-item">
                      <CheckCircle2 size={16} color="var(--color-accent-gold)" />
                      <span>{t.instantConfirmation}</span>
                    </div>
                    <div className="summary-trust-item">
                      <CheckCircle2 size={16} color="var(--color-accent-gold)" />
                      <span>{t.freeCancellation}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-restaurant-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Utensils size={16} color="var(--color-accent-gold)" />
                    <strong style={{ fontSize: '15px' }}>I Pupi Siciliani</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--color-neutral-muted)', fontSize: '13px', marginBottom: '6px' }}>
                    <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Vindegade 73, 5000 Odense C</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Phone size={15} color="var(--color-accent-gold)" />
                    <a href="tel:+4566111696" style={{ color: 'var(--color-accent-gold-dark)', fontWeight: 700, textDecoration: 'none' }}>
                      +45 66 11 16 96
                    </a>
                  </div>
                </div>
              </aside>
            </div>
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
