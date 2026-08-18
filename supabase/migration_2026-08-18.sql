-- Migración: actualiza una tabla `leads` creada con la versión inicial del
-- schema (nombre/email/telefono obligatorios, sin columna diagnostico_ia)
-- a la versión actual. Es seguro correrla aunque la tabla ya tenga datos.
-- Supabase Dashboard > SQL Editor > New query > pegar todo > Run

alter table public.leads
  alter column nombre drop not null;

alter table public.leads
  alter column email drop not null;

alter table public.leads
  alter column telefono drop not null;

alter table public.leads
  add column if not exists diagnostico_ia jsonb;

alter table public.leads
  drop column if exists nivel_digitalizacion;

alter table public.leads
  drop constraint if exists leads_contacto_check;
alter table public.leads
  add constraint leads_contacto_check check (email is not null or telefono is not null);
