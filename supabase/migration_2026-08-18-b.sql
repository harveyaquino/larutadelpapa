-- Migración: pasa la tabla `leads` del wizard genérico (2 preguntas:
-- tipo_negocio/problemas) al cuestionario "Empresa Lista" de 9 preguntas,
-- pensado específicamente para el evento de la visita del Papa León XIV.
-- Es seguro correrla aunque la tabla ya tenga datos, PERO las columnas
-- `tipo_negocio` y `problemas` (y lo que tengan guardado) se eliminan al
-- final de este script — revisa la sección final antes de correrla si
-- necesitas conservar esos datos.
-- Supabase Dashboard > SQL Editor > New query > pegar todo > Run

alter table public.leads
  add column if not exists distrito text;

alter table public.leads
  add column if not exists autorizacion text;

alter table public.leads
  add column if not exists actividad_principal text;

alter table public.leads
  add column if not exists oferta_visitantes text;

alter table public.leads
  add column if not exists capacidad_operativa text;

alter table public.leads
  add column if not exists canales_digitales text[] not null default '{}';

alter table public.leads
  add column if not exists info_actualizada text;

alter table public.leads
  add column if not exists acciones_cliente text[] not null default '{}';

alter table public.leads
  add column if not exists registro_comercial text;

alter table public.leads
  add column if not exists capacidad_consultas text;

alter table public.leads
  add column if not exists necesidades text[] not null default '{}';

-- Las columnas nuevas de respuesta obligatoria (actividad_principal,
-- oferta_visitantes, capacidad_operativa, info_actualizada,
-- registro_comercial, capacidad_consultas) se agregan sin `not null` porque
-- las filas existentes no tienen esos valores. Si la tabla está vacía o no te
-- importa perder las filas viejas, puedes forzar `not null` después con:
--   alter table public.leads alter column actividad_principal set not null;
-- (repite por cada columna) una vez que ya no haya filas con esos campos en null.

-- Actualiza el check de contacto para que dependa de la autorización en vez
-- de exigir siempre correo o teléfono.
alter table public.leads
  drop constraint if exists leads_contacto_check;
alter table public.leads
  add constraint leads_contacto_check
  check (autorizacion = 'no' or email is not null or telefono is not null);

-- Elimina las columnas del wizard genérico anterior (paso destructivo:
-- borra tipo_negocio y problemas de las filas ya guardadas). Coméntalo si
-- necesitas conservar ese historial.
alter table public.leads
  drop column if exists tipo_negocio;
alter table public.leads
  drop column if exists problemas;
