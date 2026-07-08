-- Run once in the Supabase SQL editor for this project.

CREATE TABLE IF NOT EXISTS schedule_overrides (
  barber_id TEXT NOT NULL,
  date DATE NOT NULL,
  day_off BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIME,
  end_time TIME,
  PRIMARY KEY (barber_id, date)
);

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  barber_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments (barber_id, date);

-- No policies defined on purpose: the app talks to Supabase with the service_role key
-- (server-only, bypasses RLS), so RLS just needs to be ON to keep the anon key locked out.
ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
