-- Diagnóstico Digital MYPE — CCLAM Lambayeque x IDE Solution
-- Ejecutar este script completo en: Supabase Dashboard > SQL Editor > New query > Run

create table if not exists public.leads (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  -- Datos de inscripción (opcionales)
  nombre                text,
  negocio               text,
  distrito              text,
  email                 text,
  telefono              text,
  autorizacion          text,

  -- Respuestas del diagnóstico "Empresa Lista" (9 preguntas)
  actividad_principal   text not null,
  oferta_visitantes     text not null,
  capacidad_operativa   text not null,
  canales_digitales     text[] not null default '{}',
  info_actualizada      text not null,
  acciones_cliente      text[] not null default '{}',
  registro_comercial    text not null,
  capacidad_consultas   text not null,
  necesidades           text[] not null default '{}',

  diagnostico_ia        jsonb,
  fuente                text default 'evento_papa_leon_xiv_2026'
);

-- El correo o el teléfono deben venir con algo si la persona autorizó a que le
-- enviemos el resultado (el formulario ya lo valida en el front, pero lo
-- reforzamos acá). Si eligió "No" (o no respondió), no se exige contacto.
alter table public.leads
  drop constraint if exists leads_contacto_check;
alter table public.leads
  add constraint leads_contacto_check
  check (autorizacion = 'no' or email is not null or telefono is not null);

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
