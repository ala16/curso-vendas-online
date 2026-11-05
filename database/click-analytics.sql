create table public.curso_vendas_clicks (
 event_id uuid primary key,
 link_id text not null check (link_id in ('header_home','header_local','hero_signup','hero_questions','venue_map','venue_image','closing_signup','footer_phone','footer_whatsapp','sticky_signup')),
 created_at timestamptz not null default now()
);
alter table public.curso_vendas_clicks enable row level security;
revoke all on public.curso_vendas_clicks from anon, authenticated;
grant insert (event_id, link_id) on public.curso_vendas_clicks to anon, authenticated;
grant select on public.curso_vendas_clicks to authenticated;
create policy curso_vendas_record_click on public.curso_vendas_clicks for insert to anon, authenticated with check (true);
create policy curso_vendas_admin_read on public.curso_vendas_clicks for select to authenticated using (
 (select auth.uid()) is not null and lower((select auth.jwt()->>'email')) = 'ricardorodrigues173@gmail.com'
);
create index curso_vendas_clicks_time_link on public.curso_vendas_clicks (created_at, link_id);
create function public.curso_vendas_click_summary(since_at timestamptz default null)
returns table(link_id text, clicks bigint, last_click timestamptz)
language plpgsql stable security invoker set search_path = ''
as $fn$
begin
 if auth.uid() is null or lower(coalesce(auth.jwt()->>'email','')) <> 'ricardorodrigues173@gmail.com' then
  raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
 end if;
 return query select c.link_id, count(*)::bigint, max(c.created_at)
 from public.curso_vendas_clicks c where since_at is null or c.created_at >= since_at group by c.link_id;
end; $fn$;
revoke all on function public.curso_vendas_click_summary(timestamptz) from public, anon;
grant execute on function public.curso_vendas_click_summary(timestamptz) to authenticated;

alter policy curso_vendas_admin_read on public.curso_vendas_clicks using (
 (select auth.uid()) is not null
 and coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false'
 and lower((select auth.jwt()->>'email')) = 'ricardorodrigues173@gmail.com'
);
create or replace function public.curso_vendas_click_summary(since_at timestamptz default null)
returns table(link_id text, clicks bigint, last_click timestamptz)
language plpgsql stable security invoker set search_path = ''
as $fn$
begin
 if auth.uid() is null
 or coalesce(auth.jwt()->>'is_anonymous','false') <> 'false'
 or lower(coalesce(auth.jwt()->>'email','')) <> 'ricardorodrigues173@gmail.com' then
  raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
 end if;
 return query select c.link_id, count(*)::bigint, max(c.created_at)
 from public.curso_vendas_clicks c where since_at is null or c.created_at >= since_at group by c.link_id;
end; $fn$;