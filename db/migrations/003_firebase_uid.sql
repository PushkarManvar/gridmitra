-- Phase B: Firebase ownership mapping (Decision 015).
-- Never edit applied migrations; this layers on top of 001/002.

alter table gridmitra.users add column if not exists firebase_uid text unique;