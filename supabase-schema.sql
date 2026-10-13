-- Schema per Supabase: I Pupi Siciliani - Odense
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Tabella Prenotazioni
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    table_ids TEXT[] NOT NULL,
    table_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    occasion TEXT DEFAULT 'normale',
    dietary TEXT,
    addons TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabella Tavoli Bloccati / Riservati
CREATE TABLE IF NOT EXISTS public.blocked_tables (
    id SERIAL PRIMARY KEY,
    table_id TEXT NOT NULL,
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(table_id, date)
);

-- 3. Abilita Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_tables ENABLE ROW LEVEL SECURITY;

-- 4. Policy di accesso pubblico per prenotare e visualizzare occupazione
CREATE POLICY "Consenti lettura prenotazioni per controllo orari"
ON public.reservations FOR SELECT
USING (true);

CREATE POLICY "Consenti inserimento prenotazioni"
ON public.reservations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Consenti lettura tavoli bloccati"
ON public.blocked_tables FOR SELECT
USING (true);
