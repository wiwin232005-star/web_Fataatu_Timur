-- DESA FATAATU TIMUR - GITHUB PAGES + SUPABASE
-- Jalankan SEKALI di Supabase SQL Editor.
-- Jangan menaruh service_role/secret key di website.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
 id bigint primary key default 1 check(id=1),
 name text not null default 'Desa Fataatu Timur',
 location text default 'Kec. Wewaria · Kab. Ende',
 email text default '', phone text default '', address text default '', postal_code text default '',
 office_hours text default 'Senin - Jumat, 08.00 - 15.00 WITA',
 population integer default 0, kk integer default 0, dusun integer default 0, aparatur integer default 0,
 head_village text default '', area text default '', updated_at timestamptz default now()
);
insert into public.site_settings(id) values(1) on conflict(id) do nothing;

create table if not exists public.page_content (
 slug text primary key, title text not null, subtitle text default '', content text default '', updated_at timestamptz default now()
);
create table if not exists public.news (
 id uuid primary key default gen_random_uuid(), title text not null, cat text default '', date date, summary text default '', body text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.agenda (
 id uuid primary key default gen_random_uuid(), title text not null, date date, time text default '', place text default '', description text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.gallery (
 id uuid primary key default gen_random_uuid(), title text not null, image_url text not null, storage_path text default '', description text default '', created_at timestamptz default now()
);
create table if not exists public.potentials (
 id uuid primary key default gen_random_uuid(), name text not null, cat text default '', description text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.services (
 id uuid primary key default gen_random_uuid(), name text not null, description text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.faqs (
 id uuid primary key default gen_random_uuid(), q text not null, a text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(), title text not null, category text default 'Transparansi', year integer, description text default '', file_url text not null, storage_path text default '', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(), name text not null, email text default '', subject text default '', message text not null, status text not null default 'baru' check(status in ('baru','dibaca','dibalas')), created_at timestamptz default now()
);
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 name text default '', role text not null default 'admin' check(role in ('superadmin','admin')),
 created_at timestamptz default now()
);

insert into public.page_content(slug,title,subtitle,content) values
('profil','Profil Desa','Profil umum Desa Fataatu Timur.','Silakan isi profil desa melalui Dashboard Admin.'),
('sejarah','Sejarah','Sejarah singkat berdirinya dan perkembangan Desa Fataatu Timur.','Silakan isi sejarah desa melalui Dashboard Admin.'),
('visi-misi','Visi & Misi','Visi dan misi pembangunan Desa Fataatu Timur.','Silakan isi visi dan misi melalui Dashboard Admin.'),
('struktur','Struktur Pemerintahan','Struktur organisasi Pemerintah Desa Fataatu Timur.','Silakan isi struktur pemerintahan melalui Dashboard Admin.'),
('transparansi','Transparansi Anggaran','Informasi transparansi pengelolaan anggaran desa.','Dokumen transparansi dikelola melalui menu Dokumen Transparansi.'),
('hasil-bumi','Hasil Bumi','Komoditas hasil bumi Desa Fataatu Timur.','Silakan isi hasil bumi melalui Dashboard Admin.'),
('wisata','Wisata','Potensi wisata dan destinasi Desa Fataatu Timur.','Silakan isi informasi wisata melalui Dashboard Admin.'),
('sambutan','Sambutan Kepala Desa','Sambutan Kepala Desa Fataatu Timur.','Silakan isi sambutan kepala desa melalui Dashboard Admin.')
on conflict(slug) do nothing;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path=public stable
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;

-- Admin management: user must already exist in Supabase Authentication.
create or replace function public.admin_add_by_email(p_email text, p_name text default '', p_role text default 'admin')
returns jsonb language plpgsql security definer set search_path=public,auth
as $$
declare uid uuid; em text; begin
 if not public.is_admin() then raise exception 'Akses ditolak'; end if;
 select id,email into uid,em from auth.users where lower(email)=lower(trim(p_email)) limit 1;
 if uid is null then raise exception 'User belum ada di Authentication. Buat user terlebih dahulu di Supabase Authentication > Users.'; end if;
 insert into public.admin_users(user_id,email,name,role) values(uid,em,coalesce(p_name,''),case when p_role='superadmin' then 'superadmin' else 'admin' end)
 on conflict(user_id) do update set email=excluded.email,name=excluded.name,role=excluded.role;
 return jsonb_build_object('ok',true,'user_id',uid,'email',em);
end; $$;
create or replace function public.admin_remove_by_email(p_email text)
returns jsonb language plpgsql security definer set search_path=public,auth
as $$
declare uid uuid; begin
 if not public.is_admin() then raise exception 'Akses ditolak'; end if;
 select user_id into uid from public.admin_users where lower(email)=lower(trim(p_email)) limit 1;
 if uid is null then raise exception 'Admin tidak ditemukan'; end if;
 if uid=auth.uid() then raise exception 'Anda tidak dapat menghapus akun Anda sendiri'; end if;
 delete from public.admin_users where user_id=uid;
 return jsonb_build_object('ok',true);
end; $$;

-- Reset policies so the script can be rerun safely.
do $$ declare r record; begin
 for r in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('site_settings','page_content','news','agenda','gallery','potentials','services','faqs','documents','messages','admin_users') loop execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop;
end $$;

alter table public.site_settings enable row level security;
alter table public.page_content enable row level security;
alter table public.news enable row level security;
alter table public.agenda enable row level security;
alter table public.gallery enable row level security;
alter table public.potentials enable row level security;
alter table public.services enable row level security;
alter table public.faqs enable row level security;
alter table public.documents enable row level security;
alter table public.messages enable row level security;
alter table public.admin_users enable row level security;

create policy "public read site" on public.site_settings for select to anon,authenticated using(true);
create policy "public read pages" on public.page_content for select to anon,authenticated using(true);
create policy "public read news" on public.news for select to anon,authenticated using(true);
create policy "public read agenda" on public.agenda for select to anon,authenticated using(true);
create policy "public read gallery" on public.gallery for select to anon,authenticated using(true);
create policy "public read potentials" on public.potentials for select to anon,authenticated using(true);
create policy "public read services" on public.services for select to anon,authenticated using(true);
create policy "public read faqs" on public.faqs for select to anon,authenticated using(true);
create policy "public read documents" on public.documents for select to anon,authenticated using(true);
create policy "public insert messages" on public.messages for insert to anon,authenticated with check(length(trim(name))>0 and length(trim(message))>0);

create policy "admin site all" on public.site_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin pages all" on public.page_content for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin news all" on public.news for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin agenda all" on public.agenda for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin gallery all" on public.gallery for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin potentials all" on public.potentials for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin services all" on public.services for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin faqs all" on public.faqs for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin documents all" on public.documents for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin messages select" on public.messages for select to authenticated using(public.is_admin());
create policy "admin messages update" on public.messages for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin messages delete" on public.messages for delete to authenticated using(public.is_admin());
create policy "admin users select" on public.admin_users for select to authenticated using(public.is_admin());

-- Storage buckets.
insert into storage.buckets(id,name,public) values('gallery','gallery',true) on conflict(id) do update set public=true;
insert into storage.buckets(id,name,public) values('documents','documents',true) on conflict(id) do update set public=true;
do $$ declare r record; begin
 for r in select policyname from pg_policies where schemaname='storage' and tablename='objects' and policyname in ('public view gallery files','admin upload gallery files','admin update gallery files','admin delete gallery files','public view document files','admin upload document files','admin update document files','admin delete document files') loop execute format('drop policy if exists %I on storage.objects',r.policyname); end loop;
end $$;
create policy "public view gallery files" on storage.objects for select to anon,authenticated using(bucket_id='gallery');
create policy "admin upload gallery files" on storage.objects for insert to authenticated with check(bucket_id='gallery' and public.is_admin());
create policy "admin update gallery files" on storage.objects for update to authenticated using(bucket_id='gallery' and public.is_admin()) with check(bucket_id='gallery' and public.is_admin());
create policy "admin delete gallery files" on storage.objects for delete to authenticated using(bucket_id='gallery' and public.is_admin());
create policy "public view document files" on storage.objects for select to anon,authenticated using(bucket_id='documents');
create policy "admin upload document files" on storage.objects for insert to authenticated with check(bucket_id='documents' and public.is_admin());
create policy "admin update document files" on storage.objects for update to authenticated using(bucket_id='documents' and public.is_admin()) with check(bucket_id='documents' and public.is_admin());
create policy "admin delete document files" on storage.objects for delete to authenticated using(bucket_id='documents' and public.is_admin());

grant select on public.site_settings,public.page_content,public.news,public.agenda,public.gallery,public.potentials,public.services,public.faqs,public.documents to anon,authenticated;
grant insert on public.messages to anon,authenticated;
grant select,update,delete on public.messages to authenticated;
grant insert,update,delete on public.site_settings,public.page_content,public.news,public.agenda,public.gallery,public.potentials,public.services,public.faqs,public.documents to authenticated;
grant select on public.admin_users to authenticated;
grant execute on function public.admin_add_by_email(text,text,text),public.admin_remove_by_email(text) to authenticated;
