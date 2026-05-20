-- ============================================================
-- ADD GOOGLE CALENDAR & GOOGLE MEET COLUMNS TO SLOTS TABLE
-- ============================================================
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS google_event_id text,
ADD COLUMN IF NOT EXISTS google_meet_link text;

comment on column slots.google_event_id is 'The unique ID returned by Google Calendar API.';
comment on column slots.google_meet_link is 'The generated Google Meet URL (hangoutLink).';
