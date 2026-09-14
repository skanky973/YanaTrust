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

-- ============================================================================
-- Phase 3 : Demandes de service
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: requests
-- Une demande = un besoin publié par un client (profiles.id).
-- Aucune page publique ne liste les demandes pour l'instant : seul l'auteur
-- y a accès (la mise en relation se fera via la messagerie, phase suivante).
-- ----------------------------------------------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null default '',
  budget numeric(10, 2),
  city text,
  desired_date date,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_title_length check (char_length(title) between 1 and 150),
  constraint requests_description_length check (char_length(description) <= 3000),
  constraint requests_budget_nonnegative check (budget is null or budget >= 0),
  constraint requests_status_valid check (
    status in ('open', 'in_discussion', 'completed', 'cancelled')
  ),
  constraint requests_category_valid check (
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

comment on table public.requests is 'Demande de service publiée par un client.';

create index if not exists requests_client_id_idx on public.requests (client_id);
create index if not exists requests_status_idx on public.requests (status);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function public.handle_request_update()
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

drop trigger if exists before_request_update on public.requests;
create trigger before_request_update
  before update on public.requests
  for each row execute function public.handle_request_update();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.requests enable row level security;

-- Seul l'auteur peut voir ses propres demandes (pas de page publique pour
-- l'instant : la découverte des demandes par les prestataires viendra avec
-- la messagerie/recherche avancée).
drop policy if exists "Users can view own requests" on public.requests;
create policy "Users can view own requests"
  on public.requests for select
  using (client_id = auth.uid());

drop policy if exists "Users can insert own requests" on public.requests;
create policy "Users can insert own requests"
  on public.requests for insert
  with check (client_id = auth.uid());

drop policy if exists "Users can update own requests" on public.requests;
create policy "Users can update own requests"
  on public.requests for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

drop policy if exists "Users can delete own requests" on public.requests;
create policy "Users can delete own requests"
  on public.requests for delete
  using (client_id = auth.uid());

-- ============================================================================
-- Phase 4 : Messagerie
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: conversations
-- Une conversation = un fil privé entre exactement deux utilisateurs. L'index
-- unique normalise la paire (least/greatest) pour empêcher deux conversations
-- entre les deux mêmes personnes.
-- ----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references public.profiles (id) on delete cascade,
  participant_two uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_distinct_participants check (participant_one <> participant_two)
);

create unique index if not exists conversations_participants_unique_idx
  on public.conversations (least(participant_one, participant_two), greatest(participant_one, participant_two));

create index if not exists conversations_participant_one_idx on public.conversations (participant_one);
create index if not exists conversations_participant_two_idx on public.conversations (participant_two);

-- ----------------------------------------------------------------------------
-- Table: messages
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint messages_content_length check (char_length(content) between 1 and 4000)
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- Trigger: fait remonter la conversation en tête de liste à chaque message
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists after_message_insert on public.messages;
create trigger after_message_insert
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.conversations enable row level security;

-- Seuls les deux participants peuvent voir la conversation.
drop policy if exists "Participants can view their conversations" on public.conversations;
create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_one or auth.uid() = participant_two);

-- On ne peut créer une conversation qu'en y étant soi-même participant.
drop policy if exists "Users can create conversations they participate in" on public.conversations;
create policy "Users can create conversations they participate in"
  on public.conversations for insert
  with check (auth.uid() = participant_one or auth.uid() = participant_two);

alter table public.messages enable row level security;

-- Un message n'est lisible que par les participants de sa conversation :
-- c'est la garantie qu'une conversation n'est jamais exposée à un tiers.
drop policy if exists "Participants can view messages in their conversations" on public.messages;
create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- On ne peut envoyer un message qu'en son propre nom, et uniquement dans une
-- conversation dont on fait partie.
drop policy if exists "Participants can send messages in their conversations" on public.messages;
create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Realtime : diffuse les nouveaux messages en direct aux participants
-- ----------------------------------------------------------------------------
do $$
begin
  execute 'alter publication supabase_realtime add table public.messages';
exception
  when duplicate_object then null;
end $$;
