-- Diagnóstico Digital MYPE — CCLAM Lambayeque x IDE Solution
-- Ejecutar este script completo en: Supabase Dashboard > SQL Editor > New query > Run

create table if not exists public.leads (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  nombre                text not null,
  negocio               text,
  email                 text not null,
  telefono              text not null,
  tipo_negocio          text not null,
  problemas             text[] not null default '{}',
  nivel_digitalizacion  text,
  fuente                text default 'evento_papa_leon_xiv_2026'
);

-- Seguridad: activamos RLS y solo permitimos INSERT público (anon).
-- Nadie puede leer, editar ni borrar datos usando la clave pública (anon key).
alter table public.leads enable row level security;

drop policy if exists "Permitir insert publico" on public.leads;
create policy "Permitir insert publico"
  on public.leads
  for insert
  to anon
  with check (true);

-- (No se crea policy de SELECT/UPDATE/DELETE para anon: quedan bloqueados por defecto)
-- Para ver los leads capturados, entra a Supabase > Table Editor > leads,
-- o usa el SQL Editor con tu cuenta (que sí tiene acceso completo).
