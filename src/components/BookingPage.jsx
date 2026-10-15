import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { clientTranslations } from '../i18n';
import confetti from 'canvas-confetti';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  Utensils 
} from 'lucide-react';

const DINNER_SLOTS = [
  '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45', '20:00', '20:15',
  '20:30', '20:45', '21:00'
];

const LUNCH_SLOTS = [
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45', '14:00'
];

const isHolidayClosed = (isoDateStr) => {
  if (!isoDateStr) return null;
  if (isoDateStr >= '2026-03-29' && isoDateStr <= '2026-04-07') {
    return 'Påskelukket (29/03/2026 - 07/04/2026)';
  }
  if (isoDateStr >= '2026-06-28' && isoDateStr <= '2026-07-21') {
    return 'Sommerlukket (28/06/2026 - 21/07/2026)';
  }
  if (isoDateStr >= '2026-12-20' && isoDateStr <= '2027-01-07') {
    return 'Julelukket (20/12/2026 - 07/01/2027)';
  }
  return null;
};

const getDayOfWeek = (isoDateStr) => {
  if (!isoDateStr) return 0;
  const d = new Date(isoDateStr + 'T00:00:00');
  return d.getDay();
};

const isNormallyClosed = (isoDateStr) => {
  const dow = getDayOfWeek(isoDateStr);
  return [0, 1, 2].includes(dow);
};

export default function BookingPage({ onNavigateToAdmin }) {
  const [clientLang, setClientLang] = useState('da');
  const t = clientTranslations[clientLang];

  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [serviceType, setServiceType] = useState('dinner');
  const [time, setTime] = useState('19:30');
  const [carouselOffset, setCarouselOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const isSaturday = getDayOfWeek(date) === 6;
  const isClosed = isNormallyClosed(date);

  const isDateClosed = (isoDateStr) => {
    return isHolidayClosed(isoDateStr) !== null || isNormallyClosed(isoDateStr);
  };

  const getMenuNotice = () => {
    const dow = getDayOfWeek(date);
    if (isDateClosed(date)) return null;

    if (dow === 6) {
      if (serviceType === 'lunch') {
        return {
          title: clientLang === 'da' ? 'Lørdagsfrokost Menu' : 'Saturday Lunch Menu',
          desc: clientLang === 'da' 
            ? 'Autentisk siciliansk frokostmenu med antipasti, frisk pasta og lette fiskeretter (12.00 - 14.00).'
            : 'Authentic Sicilian lunch menu with antipasti, fresh handmade pasta, and light seafood (12:00 - 14:00).'
        };
      }
      return {
        title: clientLang === 'da' ? 'Lørdagsaften Menu à la carte' : 'Saturday Dinner à la carte',
        desc: clientLang === 'da'
          ? 'Fuld à la carte menu med vores signaturretter og faste smagsmenuer efter ønske.'
          : 'Full à la carte menu with our Sicilian signature dishes and optional tasting courses.'
      };
    }

    return {
      title: clientLang === 'da' ? 'Aftenmenu à la carte' : 'Evening Menu à la carte',
      desc: clientLang === 'da'
        ? 'Køkkenet serverer autentiske sicilianske retter fra kl. 17.30 til 21.00.'
        : 'The kitchen serves authentic Sicilian dishes from 17:30 to 21:00.'
    };
  };

  const getCurrentSlots = () => {
    if (isSaturday && serviceType === 'lunch') {
      return LUNCH_SLOTS;
    }
    return DINNER_SLOTS;
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr + 'T00:00:00');
    const loc = clientLang === 'da' ? 'da-DK' : 'en-GB';
    return d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFullDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr + 'T00:00:00');
    const loc = clientLang === 'da' ? 'da-DK' : 'en-GB';
    return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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
      service_type: isSaturday ? serviceType : 'dinner',
      notes: notes,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reservations').insert([bookingData]);
        if (error) console.warn('Supabase notice:', error.message);
      }
      
      const stored = JSON.parse(localStorage.getItem('pupi_reservations') || '[]');
      const updated = [bookingData, ...stored];
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
      'PRODID:-//I Pupi Siciliani//Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Bordreservation hos I Pupi Siciliani (${guests} pers)`,
      `DESCRIPTION:Reservation for ${name}. Selskab: ${guests} personer. Noter: ${notes || 'Ingen'}.`,
      'LOCATION:Vindegade 73, 5000 Odense C, Denmark',
      `DTSTART:${startIso}`,
      `DTEND:${date.replace(/-/g, '')}T${parseInt(time.split(':')[0]) + 2}${time.split(':')[1]}00`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `reservation-ipupisiciliani-${date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="booking-page-container">
      <div className="booking-inner-wrap">
        
        {/* Top bar: Language Switcher */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setClientLang('da')}
              className={clientLang === 'da' ? 'gold-link' : ''}
              style={{
                background: clientLang === 'da' ? '#FAF6F4' : '#FFFFFF',
                border: '1.5px solid ' + (clientLang === 'da' ? 'var(--color-accent-gold)' : 'var(--color-neutral-border)'),
                borderRadius: '0px',
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

        {/* Brand Header with DALI Font */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="brand-title" style={{ fontFamily: 'DALI, serif' }}>{t.title}</h1>
          <h2 style={{ maxWidth: '640px', margin: '0 auto', fontSize: '15px' }}>{t.subtitle || t.desc}</h2>
        </header>

        {/* Stepper Tab Indicator */}
        <div className="booking-stepper-row">
          <div className="spec-stepper">
            <button
              type="button"
              className={`spec-step-btn ${step === 1 ? 'active' : ''}`}
              onClick={() => setStep(1)}
            >
              {t.step1}
            </button>
            <span className="spec-stepper-separator">/</span>
            <button
              type="button"
              className={`spec-step-btn ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
            >
              {t.step2}
            </button>
          </div>
        </div>

        {/* Form & Summary Grid */}
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
                    {/* Guest Picker (1-7, 8+) */}
                    <div className="form-group">
                      <label className="form-label">
                        <Users size={18} color="var(--color-accent-gold)" />
                        {t.summaryGuests}
                      </label>
                      <div className="guest-selector-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            className={`guest-btn ${guests === num ? 'selected' : ''}`}
                            onClick={() => setGuests(num)}
                          >
                            {num === 8 ? '8+' : num}
                            <span className="sub">
                              {num === 8 ? t.groupEightPlus : num === 1 ? t.singleGuestLabel : t.guestLabel}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* 8+ Guest Alert Notice */}
                      {guests >= 8 && (
                        <div className="alert-notice-box warning">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Phone size={16} color="var(--color-accent-gold)" />
                            <strong style={{ fontSize: '14px', color: '#111111' }}>{t.largeGroupTitle}</strong>
                          </div>
                          <p style={{ fontSize: '13px', color: '#444444', lineHeight: 1.5, margin: 0 }}>
                            {t.largeGroupDesc}
                          </p>
                          <div className="alert-actions">
                            <a href="tel:+4566111696" className="alert-action-btn">
                              <Phone size={14} />
                              <span>{t.callUs}</span>
                            </a>
                            <a href="mailto:info@ipupisiciliani.dk" className="alert-action-btn secondary">
                              <Mail size={14} />
                              <span>{t.emailUs}</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Picker with Carousel & Calendar Modal */}
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={18} color="var(--color-accent-gold)" />
                        {t.dateLabel}
                      </label>
                      
                      <div className="date-carousel-wrapper">
                        <button
                          type="button"
                          className="date-carousel-nav"
                          disabled={carouselOffset === 0}
                          onClick={() => setCarouselOffset(Math.max(0, carouselOffset - 3))}
                          aria-label="Previous dates"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <div className="date-carousel-grid">
                          {(() => {
                            const dates = [];
                            const base = new Date();
                            const locale = clientLang === 'da' ? 'da-DK' : 'en-GB';
                            for (let i = 0; i < 5; i++) {
                              const d = new Date();
                              d.setDate(base.getDate() + carouselOffset + i);
                              const iso = d.toISOString().split('T')[0];
                              const isSelected = date === iso;
                              const isToday = carouselOffset + i === 0;
                              const isTomorrow = carouselOffset + i === 1;
                              const closed = isDateClosed(iso);

                              const dayName = isToday 
                                ? t.today 
                                : isTomorrow 
                                ? t.tomorrow 
                                : d.toLocaleDateString(locale, { weekday: 'short' });
                              const dateNum = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });

                              dates.push(
                                <button
                                  key={iso}
                                  type="button"
                                  className={`date-card ${isSelected ? 'active' : ''} ${closed ? 'closed' : ''}`}
                                  onClick={() => {
                                    setDate(iso);
                                    const dow = d.getDay();
                                    if (dow !== 6 && serviceType === 'lunch') {
                                      setServiceType('dinner');
                                      setTime('19:30');
                                    }
                                  }}
                                >
                                  <span className="day-title">{dayName}</span>
                                  <span className="date-num">{dateNum}</span>
                                  {closed && <span className="closed-tag">Lukket</span>}
                                </button>
                              );
                            }
                            return dates;
                          })()}
                        </div>

                        <button
                          type="button"
                          className="date-carousel-nav"
                          onClick={() => setCarouselOffset(carouselOffset + 3)}
                          aria-label="Next dates"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      {/* Toggle Full Calendar */}
                      <button
                        type="button"
                        className="calendar-toggle-btn"
                        onClick={() => setShowCalendar(!showCalendar)}
                      >
                        <Calendar size={14} color="var(--color-accent-gold)" />
                        <span>{showCalendar ? t.closeCalendar : t.openCalendar}</span>
                      </button>

                      {showCalendar && (
                        <div className="date-input-wrapper">
                          <span className="date-input-icon">
                            <Calendar size={18} />
                          </span>
                          <input
                            type="date"
                            className="booking-input with-icon"
                            value={date}
                            min={getTodayStr()}
                            onChange={(e) => {
                              setDate(e.target.value);
                              const dow = getDayOfWeek(e.target.value);
                              if (dow !== 6 && serviceType === 'lunch') {
                                setServiceType('dinner');
                                setTime('19:30');
                              }
                            }}
                          />
                        </div>
                      )}

                      <div className="date-preview-pill">
                        <Calendar size={14} />
                        <span>{formatFullDate(date)}</span>
                      </div>
                    </div>

                    {/* Menu Card for Selected Day */}
                    {(() => {
                      const menuNotice = getMenuNotice();
                      if (!menuNotice) return null;
                      return (
                        <div className="menu-notice-card">
                          <div className="menu-notice-title">
                            <Utensils size={14} color="var(--color-accent-gold)" />
                            <span>{menuNotice.title}</span>
                          </div>
                          <div className="menu-notice-desc">
                            {menuNotice.desc}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Time Slots or Closed / Holiday Notice */}
                    {isDateClosed(date) ? (
                      <div className="alert-notice-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <Clock size={16} color="var(--color-accent-gold)" />
                          <strong style={{ fontSize: '14px', color: '#111111' }}>
                            {isHolidayClosed(date) ? t.holidayClosedTitle : t.closedDayTitle}
                          </strong>
                        </div>
                        <p style={{ fontSize: '13px', color: '#444444', lineHeight: 1.5, margin: 0 }}>
                          {isHolidayClosed(date) 
                            ? `${isHolidayClosed(date)}. ${t.holidayClosedDesc}`
                            : t.closedDayDesc
                          }
                        </p>
                        <div className="alert-actions">
                          <a href="tel:+4566111696" className="alert-action-btn">
                            <Phone size={14} />
                            <span>{t.callUs}</span>
                          </a>
                          <a href="mailto:info@ipupisiciliani.dk" className="alert-action-btn secondary">
                            <Mail size={14} />
                            <span>{t.emailUs}</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="form-group">
                        {isSaturday && (
                          <div>
                            <label className="form-label" style={{ marginBottom: '8px' }}>
                              <Utensils size={16} color="var(--color-accent-gold)" />
                              {t.serviceLabel}
                            </label>
                            <div className="service-toggle-row">
                              <button
                                type="button"
                                className={`service-tab-btn ${serviceType === 'lunch' ? 'active' : ''}`}
                                onClick={() => {
                                  setServiceType('lunch');
                                  if (!LUNCH_SLOTS.includes(time)) setTime('12:30');
                                }}
                              >
                                <Utensils size={14} />
                                <span>{t.lunchService}</span>
                              </button>
                              <button
                                type="button"
                                className={`service-tab-btn ${serviceType === 'dinner' ? 'active' : ''}`}
                                onClick={() => {
                                  setServiceType('dinner');
                                  if (!DINNER_SLOTS.includes(time)) setTime('19:30');
                                }}
                              >
                                <Clock size={14} />
                                <span>{t.eveningService}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <label className="form-label">
                            <Clock size={18} color="var(--color-accent-gold)" />
                            {t.timeLabel}
                          </label>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-muted)' }}>
                            {isSaturday && serviceType === 'lunch' ? 'Frokost (12:00 - 14:00)' : 'Køkken: 17:30 - 21:00'}
                          </span>
                        </div>

                        <div className="time-slot-grid">
                          {getCurrentSlots().map((slot) => (
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
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '28px' }}>
                  {guests >= 8 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled
                      style={{ opacity: 0.85, cursor: 'not-allowed' }}
                    >
                      <span>{clientLang === 'da' ? 'Ring eller send e-mail ved 8+ selskaber' : 'Call or email for parties of 8+'}</span>
                    </button>
                  ) : isDateClosed(date) ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled
                      style={{ opacity: 0.85, cursor: 'not-allowed' }}
                    >
                      <span>{clientLang === 'da' ? 'Lukket på den valgte dato' : 'Closed on this date'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setStep(2)}
                    >
                      <span>{t.btnProceed}</span>
                      <ArrowRight size={18} />
                    </button>
                  )}
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

          {/* Sidebar Summary */}
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

              {isSaturday && (
                <div className="summary-spec-item">
                  <span className="label-group">
                    <Utensils size={18} color="var(--color-accent-gold)" />
                    <span>{t.summaryService}</span>
                  </span>
                  <span className="val">{serviceType === 'lunch' ? t.lunchService : t.eveningService}</span>
                </div>
              )}

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

        {/* Discreet Staff Portal link in footer */}
        <footer style={{
          marginTop: '48px',
          paddingTop: '20px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--color-neutral-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Ristorante I Pupi Siciliani · Vindegade 73, 5000 Odense
          </div>
          <button
            type="button"
            onClick={onNavigateToAdmin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-neutral-muted)',
              fontSize: '12px',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ⚙︎ Accesso Staff / Planimetria
          </button>
        </footer>

        {/* Confirmation Modal Dialog */}
        {confirmedBooking && (
          <div className="spec-modal-overlay">
            <div className="spec-modal-box">
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>{t.modalTitle}</h2>
              <p style={{ color: 'var(--color-neutral-muted)', marginBottom: '24px' }}>
                {t.modalThanks} <strong>{confirmedBooking.customer_name}</strong>. {t.modalSub}{' '}
                <strong>{formatDate(date)}</strong> {t.summaryTime.toLowerCase()} <strong>{time}</strong>.
              </p>

              <div style={{ backgroundColor: 'var(--surface-section)', border: '1px solid #D1D5DB', borderRadius: '0px', padding: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '14px' }}>
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
