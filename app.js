/**
 * I PUPI SICILIANI - ODENSE | SISTEMA PRENOTAZIONE TAVOLI
 * Luxury Minimal Architecture with Supabase & Vercel readiness.
 */

// ============================================================================
// 1. DATABASE TAVOLI & BLUEPRINT REALE
// ============================================================================
const TABLES_DATA = [
  // Nord / Vetrate Vindegade (In alto)
  {
    id: 'T9',
    number: '09',
    name: 'Angelica',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 215,
    y: 155,
    width: 60,
    height: 60,
    img: 'assets/dining-room.jpg',
    desc: 'Tavolo d\'angolo vetrata nord a sinistra dell\'ingresso, luminoso ed elegante.',
    features: ['🪟 Luce naturale', '🍷 Angolo riservato', '👥 2 Ospiti (Unibile con 10 e 11)']
  },
  {
    id: 'T10',
    number: '10',
    name: 'Palermo',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 325,
    y: 155,
    width: 62,
    height: 56,
    img: 'assets/table-detail.jpg',
    desc: 'Tavolo frontale alla vetrata, perfetto singolo o unito al Tavolo 11.',
    features: ['🪟 Vista Vindegade', '✨ Modulare con T11', '👥 2 Ospiti']
  },
  {
    id: 'T11',
    number: '11',
    name: 'Catania',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 395,
    y: 155,
    width: 62,
    height: 56,
    img: 'assets/dish1.jpg',
    desc: 'Tavolo gemello del 10 lungo la vetrata nord, ideale in coppia o per gruppi fino a 6 con 9 e 10.',
    features: ['🪟 Vetrate esterne', '🔗 Modulare con 10 e 9', '👥 2 Ospiti']
  },

  // Parete Sinistra (Muro storico)
  {
    id: 'T7',
    number: '07',
    name: 'Orlando',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 215,
    y: 285,
    width: 60,
    height: 58,
    img: 'assets/dish2.jpg',
    desc: 'Tavolo caratteristico addossato al muro storico in mattoni.',
    features: ['🧱 Muro storico', '🔗 Unibile con T8 (4 pax)', '👥 2 Ospiti']
  },
  {
    id: 'T8',
    number: '08',
    name: 'Rinaldo',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 215,
    y: 355,
    width: 60,
    height: 58,
    img: 'assets/dessert.jpg',
    desc: 'Tavolo gemello del 7, atmosfera raccolta e intima con lume di candela.',
    features: ['🕯️ Lume di candela', '🔗 Unibile con T7 (4 pax)', '👥 2 Ospiti']
  },

  // Parete Destra (Sotto vetrata est)
  {
    id: 'T2',
    number: '02',
    name: 'Taormina',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 780,
    y: 140,
    width: 60,
    height: 60,
    img: 'assets/dining-room.jpg',
    desc: 'Tavolo accogliente sotto la vetrata est, perfetto per coppie o combinabile con il Tavolo 3.',
    features: ['🍷 Vista cantinetta', '🔗 Unibile con T3 (4 pax)', '👥 2 Ospiti']
  },
  {
    id: 'T3',
    number: '03',
    name: 'Etna',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 780,
    y: 245,
    width: 60,
    height: 60,
    img: 'assets/table-detail.jpg',
    desc: 'Tavolo centrale lungo la parete destra, unione naturale col Tavolo 2 per 4 ospiti.',
    features: ['🪵 Legno massello', '🔗 Modulare con T2', '👥 2 Ospiti']
  },
  {
    id: 'T4',
    number: '04',
    name: 'Siracusa',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 780,
    y: 355,
    width: 60,
    height: 60,
    img: 'assets/dish1.jpg',
    desc: 'Tavolo basso a destra, forma insieme a 5 e 6 la grande isola conviviale per 7/8 persone.',
    features: ['👑 Vista centrale', '🔗 Unione 4+5+6 (7-8 pax)', '👥 2 Ospiti']
  },

  // Centro Sala
  {
    id: 'T5',
    number: '05',
    name: 'Noto',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 630,
    y: 245,
    width: 60,
    height: 60,
    img: 'assets/dish2.jpg',
    desc: 'Tavolo centrale adiacente al Tavolo 3 e al Tavolo 6. Cuore pulsante della sala.',
    features: ['✨ Posizione centrale', '🔗 Modulare con 4 e 6', '👥 2 Ospiti']
  },
  {
    id: 'T6',
    number: '06',
    name: 'Ragusa Ibla',
    zone: 'sala',
    zoneName: 'Sala Principale',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 530,
    y: 355,
    width: 60,
    height: 60,
    img: 'assets/dining-room.jpg',
    desc: 'Tavolo centrale di fronte alla Saletta, si unisce con 5 e 4 per 7-8 persone.',
    features: ['🏺 Ceramiche di Sicilia', '🔗 Modulare con 4 e 5', '👥 2 Ospiti']
  },

  // Saletta Privata
  {
    id: 'T14',
    number: '14',
    name: 'Modica',
    zone: 'saletta',
    zoneName: 'Saletta Privata',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'square',
    x: 440,
    y: 550,
    width: 65,
    height: 65,
    img: 'assets/table-detail.jpg',
    desc: 'Tavolo d\'ingresso alla suggestiva saletta privata, si fonde con 12 e 13 per creare il Tavolone da 8.',
    features: ['🍷 Saletta riservata', '🔗 Tavolone Saletta (8 pax)', '👥 2 Ospiti']
  },
  {
    id: 'T12',
    number: '12',
    name: 'Agrigento',
    zone: 'saletta',
    zoneName: 'Saletta Privata',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 405,
    y: 730,
    width: 65,
    height: 60,
    img: 'assets/dining-room.jpg',
    desc: 'Tavolo di fondo saletta lato sinistro. Forma con il Tavolo 13 una perfetta configurazione a 4.',
    features: ['🕯️ Intimità assoluta', '🔗 Unibile con T13 (4 pax)', '👥 2 Ospiti']
  },
  {
    id: 'T13',
    number: '13',
    name: 'Ortigia',
    zone: 'saletta',
    zoneName: 'Saletta Privata',
    capacityMin: 2,
    capacityMax: 2,
    shape: 'rect',
    x: 475,
    y: 730,
    width: 65,
    height: 60,
    img: 'assets/dessert.jpg',
    desc: 'Tavolo di fondo saletta lato destro. Affiancato a 12 per 4 ospiti, o unito a 14 per 8 ospiti.',
    features: ['🌹 Massima riservatezza', '🔗 Modulare con 12 e 14', '👥 2 Ospiti']
  }
];

// Configurazioni modulari
const MODULAR_PRESETS = {
  '2,3': {
    tableIds: ['T2', 'T3'],
    name: 'Tavoli 2 + 3',
    pax: 4,
    minPax: 3,
    maxPax: 4,
    zoneName: 'Sala Principale',
    desc: 'Unione verticale parete destra per 4 persone.',
    bbox: { x: 745, y: 105, w: 70, h: 205 }
  },
  '7,8': {
    tableIds: ['T7', 'T8'],
    name: 'Tavoli 7 + 8',
    pax: 4,
    minPax: 3,
    maxPax: 4,
    zoneName: 'Sala Principale',
    desc: 'Unione verticale parete sinistra muro storico per 4 persone.',
    bbox: { x: 180, y: 250, w: 70, h: 168 }
  },
  '10,11': {
    tableIds: ['T10', 'T11'],
    name: 'Tavoli 10 + 11',
    pax: 4,
    minPax: 3,
    maxPax: 4,
    zoneName: 'Sala Principale',
    desc: 'Unione orizzontale fronte vetrate nord per 4 persone.',
    bbox: { x: 290, y: 122, w: 140, h: 66 }
  },
  '9,10,11': {
    tableIds: ['T9', 'T10', 'T11'],
    name: 'Tavoli 9 + 10 + 11',
    pax: 6,
    minPax: 5,
    maxPax: 6,
    zoneName: 'Sala Principale',
    desc: 'Fila panoramica lungo le vetrate di Vindegade per 6 persone.',
    bbox: { x: 180, y: 120, w: 250, h: 70 }
  },
  '4,5,6': {
    tableIds: ['T4', 'T5', 'T6'],
    name: 'Isola Tavoli 4 + 5 + 6',
    pax: 8,
    minPax: 7,
    maxPax: 8,
    zoneName: 'Sala Principale',
    desc: 'Composizione centrale conviviale da 7 a 8 ospiti.',
    bbox: { x: 495, y: 210, w: 320, h: 210 }
  },
  '12,13': {
    tableIds: ['T12', 'T13'],
    name: 'Saletta Tavoli 12 + 13',
    pax: 4,
    minPax: 3,
    maxPax: 4,
    zoneName: 'Saletta Privata',
    desc: 'Coppia accostata in fondo alla saletta per 4 persone.',
    bbox: { x: 368, y: 695, w: 144, h: 70 }
  },
  '12,13,14': {
    tableIds: ['T12', 'T13', 'T14'],
    name: 'Tavolone Saletta 12 + 13 + 14',
    pax: 8,
    minPax: 6,
    maxPax: 8,
    zoneName: 'Saletta Privata',
    desc: 'Esclusivo banchetto imperiale nella saletta per 8 coperti.',
    bbox: { x: 368, y: 512, w: 144, h: 255 }
  }
};

const OPENING_SCHEDULE = {
  0: { open: false },
  1: { open: false },
  2: { open: false },
  3: {
    open: true,
    sessions: [{ name: 'Cena', start: '17:30', end: '21:00', slots: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] }]
  },
  4: {
    open: true,
    sessions: [{ name: 'Cena', start: '17:30', end: '21:00', slots: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] }]
  },
  5: {
    open: true,
    sessions: [{ name: 'Cena', start: '17:30', end: '21:00', slots: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] }]
  },
  6: {
    open: true,
    sessions: [
      { name: 'Pranzo', start: '12:00', end: '14:00', slots: ['12:00', '12:30', '13:00', '13:30', '14:00'] },
      { name: 'Cena', start: '17:30', end: '21:00', slots: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] }
    ]
  }
};

// ============================================================================
// 2. CLASSE BOOKING APP
// ============================================================================
class BookingApp {
  constructor() {
    this.currentStep = 1;
    this.selectedDate = this.getInitialValidDate();
    this.selectedGuests = 2;
    this.selectedTime = '19:00';

    this.selectedTableIds = [];
    this.selectedComboKey = null;
    this.customGroupMode = false;

    this.selectedAddons = [];
    this.selectedOccasion = 'normale';
    this.dietaryNotes = '';
    this.currentZoneFilter = 'all';

    // Local Storage & Supabase ready
    this.storageKey = 'ipupi_reservations_db_v3';
    this.blockedTablesKey = 'ipupi_blocked_tables_v3';
    this.reservations = this.loadReservations();
    this.blockedTables = this.loadBlockedTables();

    this.cacheDom();
    this.initEvents();
    this.initDatePicker();
    this.renderTimeSlots();
    this.renderFloorPlanSvg();
    this.renderStaffDashboard();
    this.autoSelectMatchingTable();

    // Pull from Supabase if connected
    this.syncWithSupabase();
  }

  getInitialValidDate() {
    const now = new Date();
    let target = new Date(now);
    target.setDate(now.getDate() + 1);
    while ([0, 1, 2].includes(target.getDay())) {
      target.setDate(target.getDate() + 1);
    }
    return target.toISOString().split('T')[0];
  }

  cacheDom() {
    this.stepNodes = document.querySelectorAll('.step-node');
    this.stepPanels = {
      1: document.getElementById('step1Panel'),
      2: document.getElementById('step2Panel'),
      3: document.getElementById('step3Panel'),
      4: document.getElementById('step4Panel')
    };

    // Step 1
    this.dateInput = document.getElementById('bookingDate');
    this.dateDayOfWeekSpan = document.getElementById('dateDayOfWeek');
    this.openingAlertDiv = document.getElementById('openingAlert');
    this.guestsSelector = document.getElementById('guestsSelector');
    this.groupNote = document.getElementById('groupNote');
    this.serviceBadge = document.getElementById('serviceBadge');
    this.timeSlotsContainer = document.getElementById('timeSlotsContainer');
    this.goToStep2Btn = document.getElementById('goToStep2Btn');

    // Step 2
    this.zoneFilterPills = document.getElementById('zoneFilterPills');
    this.modularPresetsContainer = document.getElementById('modularPresets');
    this.customGroupModeBtn = document.getElementById('customGroupModeBtn');
    this.svgComboBridgesGroup = document.getElementById('svgComboBridgesGroup');
    this.svgTablesGroup = document.getElementById('svgTablesGroup');
    this.tablePreviewCard = document.getElementById('tablePreviewCard');
    this.previewEmpty = document.getElementById('previewEmpty');
    this.previewDetail = document.getElementById('previewDetail');
    this.previewImg = document.getElementById('previewImg');
    this.previewZone = document.getElementById('previewZone');
    this.previewTitle = document.getElementById('previewTitle');
    this.previewSeats = document.getElementById('previewSeats');
    this.previewDesc = document.getElementById('previewDesc');
    this.previewFeatures = document.getElementById('previewFeatures');
    this.confirmTableSelectBtn = document.getElementById('confirmTableSelectBtn');
    this.selectedTableSummary = document.getElementById('selectedTableSummary');
    this.goToStep3Btn = document.getElementById('goToStep3Btn');
    this.backToStep1Btn = document.getElementById('backToStep1Btn');

    // Step 3
    this.backToStep2Btn = document.getElementById('backToStep2Btn');
    this.goToStep4Btn = document.getElementById('goToStep4Btn');
    this.dietaryNotesInput = document.getElementById('dietaryNotes');

    // Step 4
    this.backToStep3Btn = document.getElementById('backToStep3Btn');
    this.submitBookingBtn = document.getElementById('submitBookingBtn');
    this.guestFirstName = document.getElementById('guestFirstName');
    this.guestLastName = document.getElementById('guestLastName');
    this.guestEmail = document.getElementById('guestEmail');
    this.guestPhone = document.getElementById('guestPhone');
    this.recapDateVal = document.getElementById('recapDateVal');
    this.recapTimeVal = document.getElementById('recapTimeVal');
    this.recapGuestsVal = document.getElementById('recapGuestsVal');
    this.recapTableVal = document.getElementById('recapTableVal');
    this.recapZoneVal = document.getElementById('recapZoneVal');
    this.recapAddonsRow = document.getElementById('recapAddonsRow');
    this.recapAddonsVal = document.getElementById('recapAddonsVal');

    // Modals
    this.successModal = document.getElementById('successModal');
    this.newBookingBtn = document.getElementById('newBookingBtn');
    this.downloadIcsBtn = document.getElementById('downloadIcsBtn');
    this.staffModal = document.getElementById('staffModal');
    this.openStaffBtn = document.getElementById('openStaffBtn');
    this.closeStaffBtn = document.getElementById('closeStaffBtn');
    this.staffFilterDate = document.getElementById('staffFilterDate');
    this.staffBookingsTbody = document.getElementById('staffBookingsTbody');
    this.staffTableSelect = document.getElementById('staffTableSelect');
    this.toggleBlockTableBtn = document.getElementById('toggleBlockTableBtn');
    this.resetDemoDataBtn = document.getElementById('resetDemoDataBtn');
  }

  initEvents() {
    // Nav stepper
    this.goToStep2Btn.addEventListener('click', () => this.goToStep(2));
    this.backToStep1Btn.addEventListener('click', () => this.goToStep(1));
    this.goToStep3Btn.addEventListener('click', () => this.goToStep(3));
    this.backToStep2Btn.addEventListener('click', () => this.goToStep(2));
    this.goToStep4Btn.addEventListener('click', () => {
      this.collectStep3();
      this.updateStep4Recap();
      this.goToStep(4);
    });
    this.backToStep3Btn.addEventListener('click', () => this.goToStep(3));

    this.stepNodes.forEach(node => {
      node.addEventListener('click', () => {
        const step = parseInt(node.dataset.step, 10);
        if (step < this.currentStep) {
          this.goToStep(step);
        } else if (step === 2 && this.validateStep1()) {
          this.goToStep(2);
        } else if (step === 3 && this.selectedTableIds.length > 0) {
          this.goToStep(3);
        }
      });
    });

    // Date
    this.dateInput.addEventListener('change', (e) => {
      this.selectedDate = e.target.value;
      this.handleDateChange();
    });

    // Guests selector
    this.guestsSelector.addEventListener('click', (e) => {
      const pill = e.target.closest('.big-guest-btn');
      if (!pill) return;
      const guests = pill.dataset.guests;
      if (guests === 'group') {
        this.selectedGuests = 10;
        this.enableCustomGroupMode(true);
        this.groupNote.style.display = 'block';
      } else {
        this.selectedGuests = parseInt(guests, 10);
        this.groupNote.style.display = 'none';
        if (this.selectedGuests <= 8 && this.customGroupMode) {
          this.enableCustomGroupMode(false);
        }
      }

      document.querySelectorAll('.big-guest-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      this.autoSelectMatchingTable();
      this.updateFloorPlanStates();
    });

    // Zone filters
    this.zoneFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-chip');
      if (!pill) return;
      document.querySelectorAll('.filter-chip').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      this.currentZoneFilter = pill.dataset.zone;
      this.filterTablesByZone(this.currentZoneFilter);
    });

    // Modular preset pills
    this.modularPresetsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.preset-chip');
      if (!pill || pill.id === 'customGroupModeBtn') return;
      const comboKey = pill.dataset.combo;
      if (comboKey) this.selectModularPreset(comboKey);
    });

    // Custom Group Mode toggle
    this.customGroupModeBtn.addEventListener('click', () => {
      this.enableCustomGroupMode(!this.customGroupMode);
    });

    this.confirmTableSelectBtn.addEventListener('click', () => {
      if (this.selectedTableIds.length > 0) this.goToStep(3);
    });

    this.submitBookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleBookingSubmit();
    });

    this.newBookingBtn.addEventListener('click', () => {
      this.successModal.classList.remove('active');
      this.resetBookingFlow();
    });

    this.downloadIcsBtn.addEventListener('click', () => {
      this.downloadCalendarFile();
    });

    // Staff Area
    this.openStaffBtn.addEventListener('click', () => {
      this.staffModal.classList.add('active');
      this.renderStaffDashboard();
    });

    this.closeStaffBtn.addEventListener('click', () => {
      this.staffModal.classList.remove('active');
    });

    this.staffFilterDate.addEventListener('change', () => {
      this.renderStaffDashboard();
    });

    this.toggleBlockTableBtn.addEventListener('click', () => {
      const tableId = this.staffTableSelect.value;
      if (!tableId) return;
      const idx = this.blockedTables.indexOf(tableId);
      if (idx > -1) {
        this.blockedTables.splice(idx, 1);
      } else {
        this.blockedTables.push(tableId);
      }
      this.saveBlockedTables();
      this.renderStaffDashboard();
      this.updateFloorPlanStates();
    });

    this.resetDemoDataBtn.addEventListener('click', () => {
      if (confirm('Ripristinare le prenotazioni iniziali dimostrative?')) {
        this.reservations = this.generateDemoReservations();
        this.blockedTables = [];
        this.saveReservations();
        this.saveBlockedTables();
        this.updateFloorPlanStates();
        this.renderStaffDashboard();
        alert('Dati ripristinati con successo!');
      }
    });
  }

  // ============================================================================
  // 3. DATE & TIME
  // ============================================================================
  initDatePicker() {
    this.dateInput.value = this.selectedDate;
    this.staffFilterDate.value = this.selectedDate;
    this.handleDateChange();
  }

  handleDateChange() {
    const parts = this.selectedDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = dateObj.getDay();
    const schedule = OPENING_SCHEDULE[dayOfWeek];

    const dayName = dateObj.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dateDayOfWeekSpan.textContent = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    if (!schedule || !schedule.open) {
      this.openingAlertDiv.textContent = 'Il ristorante è chiuso in questo giorno (Domenica – Martedì). Aperto per eventi privati oltre 9.000 DKK.';
      this.openingAlertDiv.style.display = 'block';
      this.timeSlotsContainer.innerHTML = '<div style="color:var(--text-dim); padding:1rem 0;">Nessun servizio disponibile in questa data.</div>';
      this.goToStep2Btn.disabled = true;
      return;
    }

    this.openingAlertDiv.style.display = 'none';
    this.goToStep2Btn.disabled = false;
    this.renderTimeSlots();
    this.updateFloorPlanStates();
  }

  renderTimeSlots() {
    const parts = this.selectedDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = dateObj.getDay();
    const schedule = OPENING_SCHEDULE[dayOfWeek];
    if (!schedule || !schedule.open) return;

    this.timeSlotsContainer.innerHTML = '';
    this.serviceBadge.textContent = dayOfWeek === 6 ? "Pranzo & Cena del Sabato" : "Cena Serale (17:30 - 21:00)";

    schedule.sessions.forEach(session => {
      session.slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `time-slot-btn ${slot === this.selectedTime ? 'active' : ''}`;
        btn.textContent = slot;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedTime = slot;
          this.updateFloorPlanStates();
        });
        this.timeSlotsContainer.appendChild(btn);
      });
    });
  }

  validateStep1() {
    const parts = this.selectedDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = dateObj.getDay();
    return OPENING_SCHEDULE[dayOfWeek] && OPENING_SCHEDULE[dayOfWeek].open;
  }

  // ============================================================================
  // 4. MODULAR ENGINE
  // ============================================================================
  autoSelectMatchingTable() {
    const guests = this.selectedGuests;

    if (guests === 4) {
      const candidates = ['2,3', '7,8', '10,11', '12,13'];
      for (const key of candidates) {
        if (this.isPresetAvailable(key)) {
          this.selectModularPreset(key);
          return;
        }
      }
    } else if (guests === 5 || guests === 6) {
      if (this.isPresetAvailable('9,10,11')) {
        this.selectModularPreset('9,10,11');
        return;
      }
    } else if (guests === 7 || guests === 8) {
      if (this.isPresetAvailable('4,5,6')) {
        this.selectModularPreset('4,5,6');
        return;
      }
      if (this.isPresetAvailable('12,13,14')) {
        this.selectModularPreset('12,13,14');
        return;
      }
    } else if (guests > 8) {
      this.enableCustomGroupMode(true);
      return;
    }

    const availSingle = TABLES_DATA.find(t => this.isTableAvailable(t.id));
    if (availSingle) {
      this.selectSingleTable(availSingle.id);
    }
  }

  isTableAvailable(tableId) {
    if (this.blockedTables.includes(tableId)) return false;
    const isBooked = this.reservations.some(b =>
      b.date === this.selectedDate &&
      b.time === this.selectedTime &&
      b.status !== 'cancelled' &&
      (b.tableId === tableId || (b.tableIds && b.tableIds.includes(tableId)))
    );
    return !isBooked;
  }

  isPresetAvailable(comboKey) {
    const preset = MODULAR_PRESETS[comboKey];
    if (!preset) return false;
    return preset.tableIds.every(id => this.isTableAvailable(id));
  }

  selectSingleTable(tableId) {
    this.selectedTableIds = [tableId];
    this.selectedComboKey = null;
    this.highlightActivePresetChip(null);
    this.updateFloorPlanStates();
    this.renderBridgesSvg();

    const table = TABLES_DATA.find(t => t.id === tableId);
    if (table) this.showTablePreview(table);
  }

  selectModularPreset(comboKey) {
    const preset = MODULAR_PRESETS[comboKey];
    if (!preset) return;

    if (!this.isPresetAvailable(comboKey)) {
      alert(`Uno o più tavoli della combinazione ${preset.name} sono già occupati per le ${this.selectedTime}.`);
      return;
    }

    this.selectedTableIds = [...preset.tableIds];
    this.selectedComboKey = comboKey;
    this.highlightActivePresetChip(comboKey);
    this.updateFloorPlanStates();
    this.renderBridgesSvg();
    this.showPresetPreview(preset);
  }

  enableCustomGroupMode(enabled) {
    this.customGroupMode = enabled;
    if (enabled) {
      this.customGroupModeBtn.classList.add('active');
      this.selectedComboKey = 'custom';
      this.highlightActivePresetChip(null);
    } else {
      this.customGroupModeBtn.classList.remove('active');
      if (this.selectedComboKey === 'custom') {
        this.selectedComboKey = null;
      }
    }
    this.updateFloorPlanStates();
    this.renderBridgesSvg();
    this.updateSelectedTableBanner();
  }

  toggleTableInCustomGroup(tableId) {
    if (!this.isTableAvailable(tableId)) {
      alert(`Il Tavolo ${tableId} è occupato per le ${this.selectedTime}.`);
      return;
    }

    const idx = this.selectedTableIds.indexOf(tableId);
    if (idx > -1) {
      this.selectedTableIds.splice(idx, 1);
    } else {
      this.selectedTableIds.push(tableId);
    }

    this.selectedComboKey = 'custom';
    this.updateFloorPlanStates();
    this.renderBridgesSvg();
    this.showCustomGroupPreview();
  }

  highlightActivePresetChip(activeKey) {
    document.querySelectorAll('.preset-chip').forEach(pill => {
      if (pill.id === 'customGroupModeBtn') return;
      pill.classList.toggle('active', pill.dataset.combo === activeKey);
    });
  }

  // ============================================================================
  // 5. SVG RENDERING
  // ============================================================================
  renderFloorPlanSvg() {
    this.svgTablesGroup.innerHTML = '';

    TABLES_DATA.forEach(table => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `svg-table-node zone-${table.zone}`);
      g.setAttribute('id', `svgTable-${table.id}`);
      g.setAttribute('data-id', table.id);

      // Chairs
      const chairsGroup = this.createChairsSvg(table);
      g.appendChild(chairsGroup);

      // Table rect
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', table.x - table.width / 2);
      rect.setAttribute('y', table.y - table.height / 2);
      rect.setAttribute('width', table.width);
      rect.setAttribute('height', table.height);
      rect.setAttribute('rx', 8);
      rect.setAttribute('class', 'table-surface');
      g.appendChild(rect);

      // Number
      const textNum = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textNum.setAttribute('x', table.x);
      textNum.setAttribute('y', table.y - 7);
      textNum.setAttribute('class', 'table-num-text');
      textNum.textContent = table.number;
      g.appendChild(textNum);

      // Name
      const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textName.setAttribute('x', table.x);
      textName.setAttribute('y', table.y + 7);
      textName.setAttribute('class', 'table-name-text');
      textName.textContent = table.name.split(' ')[0];
      g.appendChild(textName);

      // Seats
      const textSeats = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textSeats.setAttribute('x', table.x);
      textSeats.setAttribute('y', table.y + 19);
      textSeats.setAttribute('class', 'table-seats-text');
      textSeats.textContent = `${table.capacityMax}p`;
      g.appendChild(textSeats);

      // Events
      g.addEventListener('mouseenter', () => {
        if (!this.customGroupMode) this.showTablePreview(table);
      });

      g.addEventListener('click', () => {
        if (this.customGroupMode) {
          this.toggleTableInCustomGroup(table.id);
        } else {
          this.handleTableClick(table);
        }
      });

      this.svgTablesGroup.appendChild(g);
    });

    this.updateFloorPlanStates();
    this.renderBridgesSvg();
  }

  createChairsSvg(table) {
    const chairsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const chairW = 16;
    const chairH = 8;
    const halfH = table.height / 2;

    const topChair = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    topChair.setAttribute('x', table.x - chairW / 2);
    topChair.setAttribute('y', table.y - halfH - 10);
    topChair.setAttribute('width', chairW);
    topChair.setAttribute('height', chairH);
    topChair.setAttribute('rx', 3);
    topChair.setAttribute('class', 'chair-node');
    chairsGroup.appendChild(topChair);

    const botChair = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    botChair.setAttribute('x', table.x - chairW / 2);
    botChair.setAttribute('y', table.y + halfH + 2);
    botChair.setAttribute('width', chairW);
    botChair.setAttribute('height', chairH);
    botChair.setAttribute('rx', 3);
    botChair.setAttribute('class', 'chair-node');
    chairsGroup.appendChild(botChair);

    return chairsGroup;
  }

  handleTableClick(table) {
    if (!this.isTableAvailable(table.id)) {
      alert(`Il Tavolo ${table.number} (${table.name}) è già riservato o bloccato per le ${this.selectedTime}.`);
      return;
    }

    const guests = this.selectedGuests;
    if (guests > 2) {
      const matchKey = Object.keys(MODULAR_PRESETS).find(k => {
        const p = MODULAR_PRESETS[k];
        return p.tableIds.includes(table.id) && guests >= p.minPax && guests <= p.maxPax;
      });
      if (matchKey && this.isPresetAvailable(matchKey)) {
        this.selectModularPreset(matchKey);
        return;
      }
    }

    this.selectSingleTable(table.id);
  }

  renderBridgesSvg() {
    this.svgComboBridgesGroup.innerHTML = '';
    if (this.selectedTableIds.length <= 1) return;

    if (this.selectedComboKey && MODULAR_PRESETS[this.selectedComboKey]) {
      const p = MODULAR_PRESETS[this.selectedComboKey];
      const bb = p.bbox;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', bb.x);
      rect.setAttribute('y', bb.y);
      rect.setAttribute('width', bb.w);
      rect.setAttribute('height', bb.h);
      rect.setAttribute('rx', 14);
      rect.setAttribute('class', 'combo-bridge-path');
      this.svgComboBridgesGroup.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', bb.x + bb.w / 2);
      text.setAttribute('y', bb.y - 10);
      text.setAttribute('class', 'combo-bridge-label');
      text.textContent = `🔗 ${p.name} (${p.pax} pax)`;
      this.svgComboBridgesGroup.appendChild(text);
    } else {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      this.selectedTableIds.forEach(id => {
        const t = TABLES_DATA.find(x => x.id === id);
        if (t) {
          minX = Math.min(minX, t.x - t.width / 2 - 12);
          maxX = Math.max(maxX, t.x + t.width / 2 + 12);
          minY = Math.min(minY, t.y - t.height / 2 - 12);
          maxY = Math.max(maxY, t.y + t.height / 2 + 12);
        }
      });

      if (minX !== Infinity) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', minX);
        rect.setAttribute('y', minY);
        rect.setAttribute('width', maxX - minX);
        rect.setAttribute('height', maxY - minY);
        rect.setAttribute('rx', 14);
        rect.setAttribute('class', 'combo-bridge-path');
        this.svgComboBridgesGroup.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', minX + (maxX - minX) / 2);
        text.setAttribute('y', minY - 8);
        text.setAttribute('class', 'combo-bridge-label');
        text.textContent = `⚡ Gruppo (${this.selectedTableIds.length * 2} pax)`;
        this.svgComboBridgesGroup.appendChild(text);
      }
    }
  }

  getTableStateClass(table) {
    const isSelected = this.selectedTableIds.includes(table.id);
    if (isSelected) return 'state-selected';
    if (!this.isTableAvailable(table.id)) return 'state-occupied';
    return 'state-available';
  }

  updateFloorPlanStates() {
    TABLES_DATA.forEach(table => {
      const g = document.getElementById(`svgTable-${table.id}`);
      if (!g) return;
      const state = this.getTableStateClass(table);
      g.setAttribute('class', `svg-table-node zone-${table.zone} ${state}`);
    });
    this.updateSelectedTableBanner();
  }

  filterTablesByZone(zone) {
    TABLES_DATA.forEach(table => {
      const g = document.getElementById(`svgTable-${table.id}`);
      if (!g) return;
      if (zone === 'all' || table.zone === zone) {
        g.style.opacity = '1';
        g.style.pointerEvents = 'auto';
      } else {
        g.style.opacity = '0.15';
        g.style.pointerEvents = 'none';
      }
    });
  }

  // ============================================================================
  // 6. PREVIEWS & BANNER
  // ============================================================================
  showTablePreview(table) {
    this.previewEmpty.style.display = 'none';
    this.previewDetail.style.display = 'flex';

    this.previewImg.src = table.img;
    this.previewZone.textContent = table.zoneName;
    this.previewTitle.textContent = `Tavolo ${table.number} • ${table.name}`;
    this.previewSeats.textContent = `${table.capacityMax} Ospiti`;
    this.previewDesc.textContent = table.desc;

    this.previewFeatures.innerHTML = table.features
      .map(f => `<span class="feature-pill">${f}</span>`)
      .join('');

    const isAvail = this.isTableAvailable(table.id);
    const isSel = this.selectedTableIds.includes(table.id);

    if (isSel) {
      this.confirmTableSelectBtn.disabled = false;
      this.confirmTableSelectBtn.innerHTML = `<span>✓ Tavolo Selezionato</span>`;
    } else if (isAvail) {
      this.confirmTableSelectBtn.disabled = false;
      this.confirmTableSelectBtn.innerHTML = `<span>Conferma Questo Tavolo →</span>`;
    } else {
      this.confirmTableSelectBtn.disabled = true;
      this.confirmTableSelectBtn.innerHTML = `<span>Occupato</span>`;
    }
  }

  showPresetPreview(preset) {
    this.previewEmpty.style.display = 'none';
    this.previewDetail.style.display = 'flex';

    this.previewImg.src = 'assets/dining-room.jpg';
    this.previewZone.textContent = preset.zoneName;
    this.previewTitle.textContent = `🔗 ${preset.name}`;
    this.previewSeats.textContent = `${preset.pax} Ospiti`;
    this.previewDesc.textContent = preset.desc;

    this.previewFeatures.innerHTML = [
      `👥 ${preset.minPax}-${preset.maxPax} Ospiti`,
      `🧩 Tavoli uniti: ${preset.tableIds.map(id => id.replace('T', '')).join(' + ')}`,
      '✨ Massima comodità'
    ].map(f => `<span class="feature-pill">${f}</span>`).join('');

    this.confirmTableSelectBtn.disabled = false;
    this.confirmTableSelectBtn.innerHTML = `<span>Conferma Configurazione (${preset.pax} pax) →</span>`;
  }

  showCustomGroupPreview() {
    this.previewEmpty.style.display = 'none';
    this.previewDetail.style.display = 'flex';

    const count = this.selectedTableIds.length;
    const pax = count * 2;

    this.previewImg.src = 'assets/dining-room.jpg';
    this.previewZone.textContent = 'Configurazione Grupponi';
    this.previewTitle.textContent = `⚡ Gruppo Personalizzato (${count} Tavoli)`;
    this.previewSeats.textContent = `${pax} Ospiti`;
    this.previewDesc.textContent = `Tavoli uniti per il vostro evento: ${this.selectedTableIds.map(t => t.replace('T', '')).join(', ')}.`;

    this.previewFeatures.innerHTML = [
      `👥 ${pax} Coperti allestiti`,
      '🥂 Spazio riservato per eventi',
      '🎉 Tavoli uniti'
    ].map(f => `<span class="feature-pill">${f}</span>`).join('');

    this.confirmTableSelectBtn.disabled = count === 0;
    this.confirmTableSelectBtn.innerHTML = `<span>Conferma Gruppo (${pax} pax) →</span>`;
  }

  updateSelectedTableBanner() {
    if (this.selectedTableIds.length > 0) {
      if (this.selectedComboKey && MODULAR_PRESETS[this.selectedComboKey]) {
        const p = MODULAR_PRESETS[this.selectedComboKey];
        this.selectedTableSummary.textContent = `${p.name} (${p.pax} pax)`;
      } else if (this.selectedTableIds.length === 1) {
        const table = TABLES_DATA.find(t => t.id === this.selectedTableIds[0]);
        this.selectedTableSummary.textContent = `Tavolo ${table.number} - ${table.name}`;
      } else {
        const nums = this.selectedTableIds.map(id => id.replace('T', '')).join('+');
        this.selectedTableSummary.textContent = `Gruppo Tavoli ${nums} (${this.selectedTableIds.length * 2} pax)`;
      }
      this.goToStep3Btn.disabled = false;
    } else {
      this.selectedTableSummary.textContent = "Nessun tavolo selezionato";
      this.goToStep3Btn.disabled = true;
    }
  }

  // ============================================================================
  // 7. STEP 3 & STEP 4: RECAP & CONFIRMATION
  // ============================================================================
  collectStep3() {
    this.selectedAddons = [];
    document.querySelectorAll('input[name="addons"]:checked').forEach(cb => {
      this.selectedAddons.push(cb.value);
    });

    const occasionRadio = document.querySelector('input[name="occasion"]:checked');
    this.selectedOccasion = occasionRadio ? occasionRadio.value : 'normale';
    this.dietaryNotes = this.dietaryNotesInput.value.trim();
  }

  updateStep4Recap() {
    this.recapDateVal.textContent = this.selectedDate;
    this.recapTimeVal.textContent = `${this.selectedTime} (${this.selectedGuests} persone)`;
    this.recapGuestsVal.textContent = `${this.selectedGuests} ospiti`;

    if (this.selectedComboKey && MODULAR_PRESETS[this.selectedComboKey]) {
      const p = MODULAR_PRESETS[this.selectedComboKey];
      this.recapTableVal.textContent = `${p.name} (${p.pax} pax)`;
      this.recapZoneVal.textContent = p.zoneName;
    } else if (this.selectedTableIds.length === 1) {
      const table = TABLES_DATA.find(t => t.id === this.selectedTableIds[0]);
      this.recapTableVal.textContent = `Tavolo ${table.number} - ${table.name}`;
      this.recapZoneVal.textContent = table.zoneName;
    } else {
      const nums = this.selectedTableIds.map(id => id.replace('T', '')).join(' + ');
      this.recapTableVal.textContent = `Gruppo Tavoli: ${nums}`;
      this.recapZoneVal.textContent = 'Sala Principale';
    }

    if (this.selectedAddons.length > 0) {
      this.recapAddonsRow.style.display = 'flex';
      const mapNames = {
        'menu-degustazione': 'Menù Sicilia Bedda',
        'vino-etna': 'Vini dell\'Etna',
        'cannoli-festa': 'Cannolo & Bollicine'
      };
      this.recapAddonsVal.textContent = this.selectedAddons.map(a => mapNames[a] || a).join(', ');
    } else {
      this.recapAddonsRow.style.display = 'none';
    }
  }

  async handleBookingSubmit() {
    const firstName = this.guestFirstName.value.trim();
    const lastName = this.guestLastName.value.trim();
    const email = this.guestEmail.value.trim();
    const phone = this.guestPhone.value.trim();

    if (!firstName || !lastName || !email || !phone) {
      alert('Per favore compila tutti i campi obbligatori contrassegnati con *.');
      return;
    }

    const bookingCode = 'PUPI-' + Math.floor(10000 + Math.random() * 90000);
    const tableNameStr = this.selectedComboKey && MODULAR_PRESETS[this.selectedComboKey]
      ? MODULAR_PRESETS[this.selectedComboKey].name
      : this.selectedTableIds.map(id => id.replace('T', '')).join('+');

    const newReservation = {
      id: bookingCode,
      code: bookingCode,
      date: this.selectedDate,
      time: this.selectedTime,
      guests: this.selectedGuests,
      tableIds: [...this.selectedTableIds],
      tableName: tableNameStr,
      firstName,
      lastName,
      email,
      phone,
      occasion: this.selectedOccasion,
      dietary: this.dietaryNotes,
      addons: this.selectedAddons,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save locally
    this.reservations.unshift(newReservation);
    this.saveReservations();

    // Push to Supabase if connected
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('reservations').insert([{
          id: newReservation.id,
          code: newReservation.code,
          date: newReservation.date,
          time: newReservation.time,
          guests: newReservation.guests,
          table_ids: newReservation.tableIds,
          table_name: newReservation.tableName,
          first_name: newReservation.firstName,
          last_name: newReservation.lastName,
          email: newReservation.email,
          phone: newReservation.phone,
          occasion: newReservation.occasion,
          dietary: newReservation.dietary,
          addons: newReservation.addons,
          status: newReservation.status
        }]);
      } catch (err) {
        console.warn('Errore insert Supabase:', err);
      }
    }

    this.showSuccessModal(newReservation);
  }

  showSuccessModal(booking) {
    document.getElementById('successBookingCode').textContent = booking.code;
    document.getElementById('successDateTime').textContent = `${booking.date} • ${booking.time}`;
    document.getElementById('successGuests').textContent = `${booking.guests} Persone`;
    document.getElementById('successTable').textContent = `Tavoli: ${booking.tableName}`;
    document.getElementById('successName').textContent = `${booking.firstName} ${booking.lastName}`;

    this.lastCreatedBooking = booking;
    this.successModal.classList.add('active');
  }

  downloadCalendarFile() {
    if (!this.lastCreatedBooking) return;
    const b = this.lastCreatedBooking;
    const [year, month, day] = b.date.split('-');
    const [hours, mins] = b.time.split(':');
    const startDate = `${year}${month}${day}T${hours}${mins}00`;
    const endHour = String(parseInt(hours, 10) + 2).padStart(2, '0');
    const endDate = `${year}${month}${day}T${endHour}${mins}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//I Pupi Siciliani//Odense//IT',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Cena da I Pupi Siciliani (Tavoli ${b.tableName})`,
      `DESCRIPTION:Prenotazione per ${b.guests} persone. Tavoli ${b.tableName}. Ristorante I Pupi Siciliani, Odense. Tel: +45 61 44 95 25`,
      'LOCATION:Vindegade 73, 5000 Odense C, Danimarca',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `UID:${b.code}@ipupisiciliani.dk`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `prenotazione-${b.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetBookingFlow() {
    this.selectedTableIds = [];
    this.selectedComboKey = null;
    this.selectedAddons = [];
    this.guestFirstName.value = '';
    this.guestLastName.value = '';
    this.guestEmail.value = '';
    this.guestPhone.value = '';
    this.dietaryNotesInput.value = '';
    this.autoSelectMatchingTable();
    this.goToStep(1);
    this.updateFloorPlanStates();
    this.renderStaffDashboard();
  }

  goToStep(step) {
    this.currentStep = step;
    this.stepNodes.forEach(node => {
      const s = parseInt(node.dataset.step, 10);
      node.classList.remove('active', 'completed');
      if (s === step) {
        node.classList.add('active');
      } else if (s < step) {
        node.classList.add('completed');
      }
    });

    Object.keys(this.stepPanels).forEach(s => {
      this.stepPanels[s].classList.remove('active');
    });
    this.stepPanels[step].classList.add('active');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  }

  // ============================================================================
  // 8. STAFF DASHBOARD & SUPABASE SYNC
  // ============================================================================
  renderStaffDashboard() {
    const filterDate = this.staffFilterDate.value || this.selectedDate;
    const dayBookings = this.reservations.filter(b => b.date === filterDate && b.status !== 'cancelled');

    const totalGuests = dayBookings.reduce((sum, b) => sum + parseInt(b.guests, 10), 0);
    const occupiedTables = new Set(dayBookings.flatMap(b => b.tableIds || [b.tableId])).size;
    const occupancyRate = Math.round((occupiedTables / TABLES_DATA.length) * 100);

    document.getElementById('kpiBookingsCount').textContent = dayBookings.length;
    document.getElementById('kpiGuestsCount').textContent = totalGuests;
    document.getElementById('kpiOccupancyRate').textContent = `${occupancyRate}%`;

    this.staffBookingsTbody.innerHTML = '';
    if (dayBookings.length === 0) {
      this.staffBookingsTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color:var(--text-dim);">Nessuna prenotazione per ${filterDate}.</td></tr>`;
    } else {
      dayBookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${b.time}</strong></td>
          <td><span style="color:var(--gold-primary); font-weight:700;">${b.tableName}</span></td>
          <td><strong>${b.firstName} ${b.lastName}</strong></td>
          <td>${b.guests} osp.</td>
          <td><small>${b.phone}<br>${b.email}</small></td>
          <td><small>${b.occasion !== 'normale' ? '🎉 ' + b.occasion : ''} ${b.dietary ? '• ' + b.dietary : ''}</small></td>
          <td>
            <button class="btn-action-ghost sm" onclick="window.bookingApp.cancelBooking('${b.code}')" style="color:var(--status-occ);">Cancella</button>
          </td>
        `;
        this.staffBookingsTbody.appendChild(tr);
      });
    }

    this.staffTableSelect.innerHTML = TABLES_DATA.map(t => {
      const isBlocked = this.blockedTables.includes(t.id);
      return `<option value="${t.id}">${t.number} - ${t.name} (${t.zoneName}) ${isBlocked ? '[BLOCCATO]' : ''}</option>`;
    }).join('');
  }

  cancelBooking(code) {
    if (confirm(`Confermi la cancellazione della prenotazione ${code}?`)) {
      this.reservations = this.reservations.filter(b => b.code !== code);
      this.saveReservations();
      this.renderStaffDashboard();
      this.updateFloorPlanStates();
    }
  }

  async syncWithSupabase() {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await window.supabaseClient.from('reservations').select('*');
      if (data && !error && data.length > 0) {
        // Map Supabase rows to local model
        const remoteBookings = data.map(r => ({
          id: r.id,
          code: r.code,
          date: r.date,
          time: r.time,
          guests: r.guests,
          tableIds: r.table_ids,
          tableName: r.table_name,
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email,
          phone: r.phone,
          occasion: r.occasion,
          dietary: r.dietary,
          addons: r.addons,
          status: r.status,
          createdAt: r.created_at
        }));
        this.reservations = remoteBookings;
        this.saveReservations();
        this.updateFloorPlanStates();
        this.renderStaffDashboard();
      }
    } catch (e) {
      console.warn('Sync Supabase fallback:', e);
    }
  }

  loadReservations() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return this.generateDemoReservations();
  }

  saveReservations() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reservations));
    } catch (e) {
      console.warn(e);
    }
  }

  loadBlockedTables() {
    try {
      const data = localStorage.getItem(this.blockedTablesKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  saveBlockedTables() {
    try {
      localStorage.setItem(this.blockedTablesKey, JSON.stringify(this.blockedTables));
    } catch (e) {
      console.warn(e);
    }
  }

  generateDemoReservations() {
    return [
      {
        id: 'PUPI-10492',
        code: 'PUPI-10492',
        date: this.selectedDate,
        time: '19:00',
        guests: 2,
        tableIds: ['T9'],
        tableName: '09 - Angelica',
        firstName: 'Lars',
        lastName: 'Mikkelsen',
        email: 'lars.m@example.dk',
        phone: '+45 22 14 55 90',
        occasion: 'anniversario',
        dietary: 'Un ospite non consuma crostacei',
        addons: ['vino-etna'],
        status: 'confirmed'
      },
      {
        id: 'PUPI-74912',
        code: 'PUPI-74912',
        date: this.selectedDate,
        time: '19:30',
        guests: 4,
        tableIds: ['T7', 'T8'],
        tableName: 'Tavoli 7 + 8',
        firstName: 'Frederikke',
        lastName: 'Hansen',
        email: 'frederikke@example.dk',
        phone: '+45 51 88 12 30',
        occasion: 'compleanno',
        dietary: '',
        addons: ['menu-degustazione'],
        status: 'confirmed'
      }
    ];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bookingApp = new BookingApp();
});
