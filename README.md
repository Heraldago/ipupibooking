# I Pupi Siciliani – Online Visual Reservation System

Sistema di prenotazione visivo e modulare per il ristorante **I Pupi Siciliani** (Vindegade 73, Odense C, Danimarca).

## 🚀 Stack & Deploy
- **Frontend**: Vanilla ES6 Modern Modular Architecture (Zero build dependencies, ultra-fast CDN load, perfect for Vercel).
- **Backend / DB**: Supabase (PostgreSQL with RLS policies).
- **Hosting**: Vercel (Edge CDN via `vercel.json`).

## 🗄️ Configurazione Supabase
1. Crea un progetto su [Supabase](https://supabase.com).
2. Vai su **SQL Editor** ed esegui il file `supabase-schema.sql`.
3. Inserisci il tuo `SUPABASE_URL` e `SUPABASE_ANON_KEY` in `supabase-config.js` o tramite variabili d'ambiente.

## 🚢 Deploy su Vercel & GitHub
```bash
git init
git add .
git commit -m "feat: luxury visual reservation system for I Pupi Siciliani"
git branch -M main
git remote add origin https://github.com/<your-user>/ipupisiciliani-booking.git
git push -u origin main
```
Collega poi il repository su [vercel.com](https://vercel.com) per il deploy istantaneo.
