-- ============================================================================
-- YanaTrust — Schéma Supabase
-- Phase 1 : Authentification + profils
-- ============================================================================
-- Ce fichier est la source de vérité du schéma. Toute évolution future doit
-- être ajoutée ici (et appliquée via une migration Supabase), jamais dans
-- une structure parallèle.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Table: profiles
-- Un profil par utilisateur (auth.users.id). Un utilisateur peut être à la
-- fois client et prestataire (is_provider = true active le "mode prestataire").
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  city text,
  service_area text,
  avatar_url text,
  bio text,
  is_provider boolean not null default false,
  phone_verified boolean not null default false,
  identity_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bio_length check (char_length(bio) <= 2000),
  constraint first_name_length check (char_length(first_name) <= 100),
  constraint last_name_length check (char_length(last_name) <= 100)
);

comment on table public.profiles is 'Profil public/semi-public lié à un compte auth.users.';
comment on column public.profiles.is_provider is 'true si l''utilisateur propose des services (statut prestataire).';
comment on column public.profiles.phone_verified is 'Ne peut être mis à true que par un processus serveur (service_role), jamais par l''utilisateur.';
comment on column public.profiles.identity_verified is 'Ne peut être mis à true que par un processus serveur (service_role), jamais par l''utilisateur.';

create index if not exists profiles_city_idx on public.profiles (city);
create index if not exists profiles_is_provider_idx on public.profiles (is_provider);

-- ----------------------------------------------------------------------------
-- Trigger: création automatique du profil à l'inscription
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automatique + protection des champs de vérification
-- Empêche un utilisateur de s'auto-certifier (phone_verified / identity_verified)
-- ----------------------------------------------------------------------------
create or replace function public.handle_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.phone_verified := old.phone_verified;
    new.identity_verified := old.identity_verified;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists before_profile_update on public.profiles;
create trigger before_profile_update
  before update on public.profiles
  for each row execute function public.handle_profile_update();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Les profils sont lisibles publiquement (nécessaire pour les futures pages
-- publiques /prestataires/[id]). Aucune donnée sensible (mot de passe, email,
-- clés) n'est stockée dans cette table.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Un utilisateur ne peut modifier que son propre profil.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Aucune policy INSERT/DELETE pour le rôle "authenticated" : la création
-- passe uniquement par le trigger handle_new_user (security definer), ce qui
-- empêche la création de profils arbitraires ou orphelins.

-- ============================================================================
-- Phase 2 : Services
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: services
-- Un service = une offre publiée par un prestataire (profiles.id).
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null default '',
  price_from numeric(10, 2),
  city text,
  service_area text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_title_length check (char_length(title) between 1 and 150),
  constraint services_description_length check (char_length(description) <= 3000),
  constraint services_price_nonnegative check (price_from is null or price_from >= 0),
  constraint services_status_valid check (status in ('active', 'archived')),
  constraint services_category_valid check (
    category in (
      'menage',
      'bricolage',
      'jardinage',
      'demenagement',
      'reparation',
      'beaute_bien_etre',
      'cours_particuliers',
      'transport',
      'evenementiel',
      'autre'
    )
  )
);

comment on table public.services is 'Offre de service publiée par un prestataire.';
comment on column public.services.status is '''active'' (visible publiquement) ou ''archived'' (masqué, visible du seul propriétaire).';

create index if not exists services_provider_id_idx on public.services (provider_id);
create index if not exists services_status_idx on public.services (status);
create index if not exists services_category_idx on public.services (category);
create index if not exists services_city_idx on public.services (city);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function public.handle_service_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists before_service_update on public.services;
create trigger before_service_update
  before update on public.services
  for each row execute function public.handle_service_update();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.services enable row level security;

-- Les services actifs sont visibles par tous ; un prestataire voit aussi ses
-- propres services archivés (pour pouvoir les gérer).
drop policy if exists "Active services are viewable by everyone" on public.services;
create policy "Active services are viewable by everyone"
  on public.services for select
  using (status = 'active' or provider_id = auth.uid());

-- Un utilisateur ne peut créer un service qu'en son propre nom.
drop policy if exists "Users can insert own services" on public.services;
create policy "Users can insert own services"
  on public.services for insert
  with check (provider_id = auth.uid());

-- Un utilisateur ne peut modifier que ses propres services.
drop policy if exists "Users can update own services" on public.services;
create policy "Users can update own services"
  on public.services for update
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

-- Un utilisateur ne peut supprimer que ses propres services.
drop policy if exists "Users can delete own services" on public.services;
create policy "Users can delete own services"
  on public.services for delete
  using (provider_id = auth.uid());
