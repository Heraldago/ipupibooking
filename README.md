# I Pupi Siciliani — Booking System (React + Vite)

Sistema di prenotazione tavoli interattivo per la trattoria siciliana **I Pupi Siciliani** (Odense, Danimarca).

## 🎨 Design & Palette
- **Sfondo**: Bianco seta e rosa cipria (`#FDF9F8`, `#FAF2EE`)
- **Tipografia**: Serif elegante *Cormorant Garamond* e sans-serif *Plus Jakarta Sans*
- **Testi & Bottoni**: Marrone caffè/espresso scuro (`#24140E`) e accenti rame/oro rosa (`#C27060`)
- **Interattività**: Mappa vettoriale dei tavoli (2–14), modularità sala e saletta, export calendario `.ics`.

## 🚀 Setup Locale
```bash
npm install
npm run dev
```
Apri [http://localhost:3000](http://localhost:3000).

## 🗄️ Supabase
1. Esegui lo script SQL presente in [`supabase-schema.sql`](./supabase-schema.sql) nel **SQL Editor** di Supabase.
2. Crea un file `.env` (o imposta le variabili in Vercel):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🌐 Deploy su Vercel
1. Collega il repository GitHub `git@github.com:Heraldago/ipupibooking.git`.
2. Framework Preset: **Vite**.
3. Aggiungi le variabili d'ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Deploy!
