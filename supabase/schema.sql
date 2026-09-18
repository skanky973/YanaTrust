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
  insert into public.profiles (id, first_name, last_name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'city'
  )
  on conflict (id) do nothing;

  insert into public.profile_phones (id, phone)
  values (new.id, new.raw_user_meta_data ->> 'phone')
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

-- Messages système : posés par le serveur (service_role) pour annoncer un fait
-- vérifié, comme la confirmation d'une réservation de covoiturage. Ils n'ont
-- pas d'auteur, d'où sender_id rendu nullable — c'est aussi ce qui les rend
-- infalsifiables : la policy d'insertion exige sender_id = auth.uid(), donc un
-- utilisateur ne peut jamais en créer un (NULL = auth.uid() n'est jamais vrai).
alter table public.messages add column if not exists is_system boolean not null default false;
alter table public.messages alter column sender_id drop not null;

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

-- ============================================================================
-- Phase 5 : Avis
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: reviews
-- Un avis = une note laissée par un utilisateur (author) à un autre
-- (provider). La note moyenne d'un prestataire se calcule en agrégeant ces
-- lignes (pas de colonne dénormalisée à maintenir).
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null,
  comment text,
  punctuality smallint,
  quality smallint,
  communication smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_distinct_people check (provider_id <> author_id),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_punctuality_range check (punctuality is null or punctuality between 1 and 5),
  constraint reviews_quality_range check (quality is null or quality between 1 and 5),
  constraint reviews_communication_range check (communication is null or communication between 1 and 5),
  constraint reviews_comment_length check (comment is null or char_length(comment) <= 2000),
  unique (provider_id, author_id)
);

comment on table public.reviews is 'Avis laissé par un utilisateur (author_id) à propos d''un autre (provider_id).';

create index if not exists reviews_provider_id_idx on public.reviews (provider_id);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automatique
-- ----------------------------------------------------------------------------
create or replace function public.handle_review_update()
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

drop trigger if exists before_review_update on public.reviews;
create trigger before_review_update
  before update on public.reviews
  for each row execute function public.handle_review_update();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.reviews enable row level security;

-- Les avis sont publics (ils aident les autres utilisateurs à choisir un
-- prestataire de confiance).
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

-- On ne peut laisser un avis qu'en son propre nom, et uniquement à quelqu'un
-- avec qui on a déjà échangé au moins une conversation : ça empêche les avis
-- totalement arbitraires sans relation préalable entre les utilisateurs.
drop policy if exists "Users can review people they have messaged" on public.reviews;
create policy "Users can review people they have messaged"
  on public.reviews for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where (c.participant_one = auth.uid() and c.participant_two = provider_id)
         or (c.participant_two = auth.uid() and c.participant_one = provider_id)
    )
  );

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
  on public.reviews for update
  using (author_id = auth.uid())
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where (c.participant_one = auth.uid() and c.participant_two = provider_id)
         or (c.participant_two = auth.uid() and c.participant_one = provider_id)
    )
  );

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (author_id = auth.uid());

-- ============================================================================
-- Phase 6 : Favoris, signalement/modération, photos de services
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Favoris
-- ----------------------------------------------------------------------------
create table if not exists public.favorite_providers (
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, provider_id),
  constraint favorite_providers_not_self check (user_id <> provider_id)
);

create table if not exists public.favorite_services (
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

alter table public.favorite_providers enable row level security;
drop policy if exists "Users manage their own favorite providers" on public.favorite_providers;
create policy "Users manage their own favorite providers"
  on public.favorite_providers for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.favorite_services enable row level security;
drop policy if exists "Users manage their own favorite services" on public.favorite_services;
create policy "Users manage their own favorite services"
  on public.favorite_services for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Signalement / modération
-- Base simple pour un futur back-office administrateur : pas de lecture ni de
-- traitement des signalements par les utilisateurs eux-mêmes, seulement la
-- création. target_id n'a pas de contrainte de clé étrangère (il pointe vers
-- profiles, services ou messages selon target_type).
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint reports_target_type_valid check (target_type in ('profile', 'service', 'message')),
  constraint reports_status_valid check (status in ('pending', 'reviewed', 'dismissed')),
  constraint reports_reason_length check (char_length(reason) between 1 and 1000)
);

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

alter table public.reports enable row level security;

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Photos de services
-- ----------------------------------------------------------------------------
create table if not exists public.service_photos (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  path text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists service_photos_service_id_idx on public.service_photos (service_id);

alter table public.service_photos enable row level security;

drop policy if exists "Service photos are viewable by everyone" on public.service_photos;
create policy "Service photos are viewable by everyone"
  on public.service_photos for select
  using (true);

drop policy if exists "Providers can add photos to own services" on public.service_photos;
create policy "Providers can add photos to own services"
  on public.service_photos for insert
  with check (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.provider_id = auth.uid()
    )
  );

drop policy if exists "Providers can delete photos of own services" on public.service_photos;
create policy "Providers can delete photos of own services"
  on public.service_photos for delete
  using (
    exists (
      select 1 from public.services s
      where s.id = service_id and s.provider_id = auth.uid()
    )
  );

-- Bucket de stockage public pour les photos de services (lecture publique,
-- écriture réservée aux utilisateurs authentifiés, suppression réservée au
-- propriétaire du fichier).
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to service photos" on storage.objects;
create policy "Public read access to service photos"
  on storage.objects for select
  using (bucket_id = 'service-photos');

drop policy if exists "Authenticated users can upload service photos" on storage.objects;
create policy "Authenticated users can upload service photos"
  on storage.objects for insert
  with check (bucket_id = 'service-photos' and auth.role() = 'authenticated');

drop policy if exists "Owners can delete their service photos" on storage.objects;
create policy "Owners can delete their service photos"
  on storage.objects for delete
  using (bucket_id = 'service-photos' and owner = auth.uid());

-- ============================================================================
-- Phase 7 : Planning prestataire (interventions)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: interventions
-- Une intervention planifiée entre un prestataire et un client, avec cycle de
-- vie complet (demande -> confirmation -> réalisation -> validation client).
-- ----------------------------------------------------------------------------
create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null default '',
  address text,
  client_phone text,
  scheduled_date date not null,
  start_time time not null,
  duration_minutes integer not null default 60,
  price numeric(10, 2),
  final_price numeric(10, 2),
  status text not null default 'new_request',
  provider_note text,
  work_notes text,
  materials_used text,
  needs_followup boolean not null default false,
  client_validated_at timestamptz,
  client_reported_problem boolean not null default false,
  client_comment text,
  client_rating smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interventions_distinct_people check (provider_id <> client_id),
  constraint interventions_duration_positive check (duration_minutes > 0),
  constraint interventions_status_valid check (
    status in (
      'new_request', 'pending_confirmation', 'confirmed', 'scheduled',
      'on_the_way', 'in_progress', 'completed', 'validated', 'cancelled'
    )
  ),
  constraint interventions_category_valid check (
    category in (
      'menage', 'bricolage', 'jardinage', 'demenagement', 'reparation',
      'beaute_bien_etre', 'cours_particuliers', 'transport', 'evenementiel', 'autre'
    )
  ),
  constraint interventions_client_rating_range check (
    client_rating is null or client_rating between 1 and 5
  )
);

comment on table public.interventions is 'Intervention planifiée entre un prestataire et un client, avec suivi de statut.';

create index if not exists interventions_provider_id_idx on public.interventions (provider_id);
create index if not exists interventions_client_id_idx on public.interventions (client_id);
create index if not exists interventions_status_idx on public.interventions (status);
create index if not exists interventions_scheduled_date_idx on public.interventions (scheduled_date);

-- ----------------------------------------------------------------------------
-- Trigger: protège les champs selon qui modifie (client vs prestataire) et
-- maintient updated_at. Le client ne peut agir que sur la validation finale.
-- ----------------------------------------------------------------------------
create or replace function public.protect_intervention_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.provider_id := old.provider_id;
  new.client_id := old.client_id;

  if auth.uid() = old.client_id and auth.uid() <> old.provider_id then
    new.title := old.title;
    new.category := old.category;
    new.description := old.description;
    new.address := old.address;
    new.client_phone := old.client_phone;
    new.scheduled_date := old.scheduled_date;
    new.start_time := old.start_time;
    new.duration_minutes := old.duration_minutes;
    new.price := old.price;
    new.final_price := old.final_price;
    new.provider_note := old.provider_note;
    new.work_notes := old.work_notes;
    new.materials_used := old.materials_used;
    new.needs_followup := old.needs_followup;

    if not (old.status = 'completed' and new.status = 'validated') then
      new.status := old.status;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists before_intervention_update on public.interventions;
create trigger before_intervention_update
  before update on public.interventions
  for each row execute function public.protect_intervention_fields();

-- ----------------------------------------------------------------------------
-- Table: intervention_status_history
-- Historique immuable des changements de statut, alimenté automatiquement.
-- ----------------------------------------------------------------------------
create table if not exists public.intervention_status_history (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists intervention_status_history_intervention_id_idx
  on public.intervention_status_history (intervention_id, created_at);

create or replace function public.log_intervention_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into public.intervention_status_history (intervention_id, from_status, to_status, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists after_intervention_status_change on public.interventions;
create trigger after_intervention_status_change
  after insert or update on public.interventions
  for each row execute function public.log_intervention_status_change();

-- ----------------------------------------------------------------------------
-- Table: intervention_photos (avant / après)
-- ----------------------------------------------------------------------------
create table if not exists public.intervention_photos (
  id uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  type text not null,
  path text not null,
  created_at timestamptz not null default now(),
  constraint intervention_photos_type_valid check (type in ('before', 'after'))
);

create index if not exists intervention_photos_intervention_id_idx
  on public.intervention_photos (intervention_id);

-- ----------------------------------------------------------------------------
-- Disponibilités du prestataire
-- ----------------------------------------------------------------------------
create table if not exists public.provider_weekly_availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  constraint provider_weekly_availability_day_valid check (day_of_week between 0 and 6),
  constraint provider_weekly_availability_time_order check (end_time > start_time)
);

create index if not exists provider_weekly_availability_provider_id_idx
  on public.provider_weekly_availability (provider_id);

create table if not exists public.provider_unavailable_dates (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (provider_id, date)
);

create index if not exists provider_unavailable_dates_provider_id_idx
  on public.provider_unavailable_dates (provider_id);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  intervention_id uuid references public.interventions (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_type_valid check (
    type in (
      'new_request', 'request_accepted', 'appointment_changed', 'upcoming_intervention',
      'cancelled', 'completed', 'validation_requested', 'client_validated', 'client_problem'
    )
  )
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, created_at);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.interventions enable row level security;

drop policy if exists "Participants can view their interventions" on public.interventions;
create policy "Participants can view their interventions"
  on public.interventions for select
  using (provider_id = auth.uid() or client_id = auth.uid());

-- Seul le prestataire crée des interventions (aucun flux client-initié dans
-- l'app) : la policy est resserrée en conséquence, en défense en profondeur
-- avec la vérification is_provider faite côté application.
drop policy if exists "Provider or client can create interventions" on public.interventions;
drop policy if exists "Provider can create interventions" on public.interventions;
create policy "Provider can create interventions"
  on public.interventions for insert
  with check (provider_id = auth.uid());

drop policy if exists "Participants can update their interventions" on public.interventions;
create policy "Participants can update their interventions"
  on public.interventions for update
  using (provider_id = auth.uid() or client_id = auth.uid())
  with check (provider_id = auth.uid() or client_id = auth.uid());

drop policy if exists "Provider can delete own interventions" on public.interventions;
create policy "Provider can delete own interventions"
  on public.interventions for delete
  using (provider_id = auth.uid());

alter table public.intervention_status_history enable row level security;

drop policy if exists "Participants can view status history" on public.intervention_status_history;
create policy "Participants can view status history"
  on public.intervention_status_history for select
  using (
    exists (
      select 1 from public.interventions i
      where i.id = intervention_id
        and (i.provider_id = auth.uid() or i.client_id = auth.uid())
    )
  );

alter table public.intervention_photos enable row level security;

drop policy if exists "Participants can view intervention photos" on public.intervention_photos;
create policy "Participants can view intervention photos"
  on public.intervention_photos for select
  using (
    exists (
      select 1 from public.interventions i
      where i.id = intervention_id
        and (i.provider_id = auth.uid() or i.client_id = auth.uid())
    )
  );

drop policy if exists "Provider can add intervention photos" on public.intervention_photos;
create policy "Provider can add intervention photos"
  on public.intervention_photos for insert
  with check (
    exists (
      select 1 from public.interventions i
      where i.id = intervention_id and i.provider_id = auth.uid()
    )
  );

drop policy if exists "Provider can delete intervention photos" on public.intervention_photos;
create policy "Provider can delete intervention photos"
  on public.intervention_photos for delete
  using (
    exists (
      select 1 from public.interventions i
      where i.id = intervention_id and i.provider_id = auth.uid()
    )
  );

alter table public.provider_weekly_availability enable row level security;

drop policy if exists "Availability is viewable by everyone" on public.provider_weekly_availability;
create policy "Availability is viewable by everyone"
  on public.provider_weekly_availability for select
  using (true);

drop policy if exists "Providers manage their own availability" on public.provider_weekly_availability;
create policy "Providers manage their own availability"
  on public.provider_weekly_availability for all
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

alter table public.provider_unavailable_dates enable row level security;

drop policy if exists "Unavailable dates are viewable by everyone" on public.provider_unavailable_dates;
create policy "Unavailable dates are viewable by everyone"
  on public.provider_unavailable_dates for select
  using (true);

drop policy if exists "Providers manage their own unavailable dates" on public.provider_unavailable_dates;
create policy "Providers manage their own unavailable dates"
  on public.provider_unavailable_dates for all
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Correctif sécurité : la policy précédente vérifiait seulement que l'auteur
-- était participant de l'intervention, sans jamais contraindre user_id — ce
-- qui permettait d'envoyer une fausse notification à n'importe qui. Elle
-- doit obligatoirement cibler l'AUTRE participant de cette même intervention.
drop policy if exists "Participants can create notifications for their interventions" on public.notifications;
drop policy if exists "Participants can create notifications for the other party" on public.notifications;
create policy "Participants can create notifications for the other party"
  on public.notifications for insert
  with check (
    intervention_id is not null
    and exists (
      select 1 from public.interventions i
      where i.id = intervention_id
        and (
          (i.provider_id = auth.uid() and i.client_id = user_id)
          or (i.client_id = auth.uid() and i.provider_id = user_id)
        )
    )
  );

-- ----------------------------------------------------------------------------
-- Bucket de stockage privé pour les photos d'intervention (contrairement aux
-- photos de service, ce ne sont pas des données publiques : elles montrent le
-- domicile/bien du client). Accès restreint aux deux participants via le
-- premier segment du chemin, qui doit être l'id de l'intervention.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('intervention-photos', 'intervention-photos', false)
on conflict (id) do nothing;

drop policy if exists "Participants can read intervention photos" on storage.objects;
create policy "Participants can read intervention photos"
  on storage.objects for select
  using (
    bucket_id = 'intervention-photos'
    and exists (
      select 1 from public.interventions i
      where i.id::text = (storage.foldername(name))[1]
        and (i.provider_id = auth.uid() or i.client_id = auth.uid())
    )
  );

drop policy if exists "Provider can upload intervention photos" on storage.objects;
create policy "Provider can upload intervention photos"
  on storage.objects for insert
  with check (
    bucket_id = 'intervention-photos'
    and exists (
      select 1 from public.interventions i
      where i.id::text = (storage.foldername(name))[1] and i.provider_id = auth.uid()
    )
  );

drop policy if exists "Provider can delete intervention photos from storage" on storage.objects;
create policy "Provider can delete intervention photos from storage"
  on storage.objects for delete
  using (
    bucket_id = 'intervention-photos'
    and exists (
      select 1 from public.interventions i
      where i.id::text = (storage.foldername(name))[1] and i.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- Phase 8 : Correctif sécurité — téléphone déplacé hors de profiles
-- ============================================================================
-- profiles était lisible publiquement (using (true)), ce qui exposait le
-- numéro de téléphone de tout le monde via l'API REST, même si l'interface
-- ne l'affichait jamais à des inconnus (RLS filtre les lignes, pas les
-- colonnes). Le téléphone est déplacé dans une table à part, lisible
-- uniquement par son propriétaire.
-- ----------------------------------------------------------------------------
create table if not exists public.profile_phones (
  id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  updated_at timestamptz not null default now()
);

comment on table public.profile_phones is 'Numéro de téléphone du compte, privé (lisible par son seul propriétaire), séparé de profiles qui est public.';

-- Migration des données existantes, puis suppression de la colonne d'origine.
-- Protégé par un test d'existence pour rester idempotent sur une base neuve
-- (où profiles n'a jamais eu de colonne phone).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone'
  ) then
    insert into public.profile_phones (id, phone)
    select id, phone from public.profiles where phone is not null
    on conflict (id) do nothing;

    alter table public.profiles drop column phone;
  end if;
end $$;

alter table public.profile_phones enable row level security;

drop policy if exists "Users can view own phone" on public.profile_phones;
create policy "Users can view own phone"
  on public.profile_phones for select
  using (id = auth.uid());

drop policy if exists "Users can insert own phone" on public.profile_phones;
create policy "Users can insert own phone"
  on public.profile_phones for insert
  with check (id = auth.uid());

drop policy if exists "Users can update own phone" on public.profile_phones;
create policy "Users can update own phone"
  on public.profile_phones for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================================
-- Phase 9 : Candidatures, propositions de créneaux et double validation
-- ============================================================================
-- Les demandes deviennent visibles aux prestataires (elles ne l'étaient pas
-- avant), qui peuvent y postuler. Le client accepte une candidature pour
-- ouvrir une conversation, puis prestataire et client négocient un créneau
-- via booking_proposals, avec double validation avant confirmation.

-- ----------------------------------------------------------------------------
-- requests : élargissement des statuts + visibilité prestataire (additive,
-- ne retire aucun droit existant : Postgres combine les policies avec OR).
-- ----------------------------------------------------------------------------
alter table public.requests drop constraint if exists requests_status_valid;
alter table public.requests add constraint requests_status_valid check (
  status in (
    'draft', 'open', 'in_discussion', 'planning_in_progress',
    'confirmed', 'in_progress', 'completed', 'cancelled'
  )
);

-- Note : la policy "Providers can view open requests or ones they applied to"
-- est créée plus bas dans ce fichier, une fois la table request_applications
-- elle-même créée (elle ne peut pas référencer une table qui n'existe pas
-- encore au moment de la création de la policy).

-- ----------------------------------------------------------------------------
-- Table: request_photos
-- ----------------------------------------------------------------------------
create table if not exists public.request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists request_photos_request_id_idx on public.request_photos (request_id);

alter table public.request_photos enable row level security;

-- Note : la policy SELECT "Same visibility as the parent request" est créée
-- plus bas, une fois la table request_applications elle-même créée (elle ne
-- peut pas référencer une table qui n'existe pas encore).

drop policy if exists "Client can add photos to own request" on public.request_photos;
create policy "Client can add photos to own request"
  on public.request_photos for insert
  with check (
    exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid())
  );

drop policy if exists "Client can delete photos of own request" on public.request_photos;
create policy "Client can delete photos of own request"
  on public.request_photos for delete
  using (
    exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Table: request_applications (candidatures des prestataires)
-- ----------------------------------------------------------------------------
create table if not exists public.request_applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  message text not null default '',
  proposed_price numeric(10, 2),
  estimated_duration_minutes integer,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint request_applications_status_valid check (
    status in ('pending', 'accepted_for_discussion', 'refused', 'not_retained')
  ),
  constraint request_applications_price_nonnegative check (
    proposed_price is null or proposed_price >= 0
  ),
  constraint request_applications_duration_positive check (
    estimated_duration_minutes is null or estimated_duration_minutes > 0
  ),
  constraint request_applications_message_length check (char_length(message) <= 2000),
  unique (request_id, provider_id)
);

comment on table public.request_applications is 'Candidature d''un prestataire à une demande de service.';

create index if not exists request_applications_request_id_idx on public.request_applications (request_id);
create index if not exists request_applications_provider_id_idx on public.request_applications (provider_id);

-- Le client ne peut agir que sur le statut (accepter/refuser/non-retenue) ;
-- le prestataire ne peut modifier sa proposition que tant qu'elle est en
-- attente, et ne change jamais lui-même le statut.
create or replace function public.protect_request_application_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_client boolean;
begin
  -- Laisse passer sans restriction la cascade système déclenchée par
  -- handle_booking_proposal_confirmed (ex: marquer les autres candidatures
  -- "non retenue" pour des prestataires autres que l'appelant).
  if coalesce(current_setting('app.bypass_protection', true), 'false') = 'true' then
    new.updated_at := now();
    return new;
  end if;

  select exists(
    select 1 from public.requests r where r.id = old.request_id and r.client_id = auth.uid()
  ) into is_client;

  new.request_id := old.request_id;
  new.provider_id := old.provider_id;

  if is_client then
    new.message := old.message;
    new.proposed_price := old.proposed_price;
    new.estimated_duration_minutes := old.estimated_duration_minutes;
    new.note := old.note;
    if new.status not in ('accepted_for_discussion', 'refused', 'not_retained') then
      new.status := old.status;
    end if;
  elsif auth.uid() = old.provider_id then
    if old.status <> 'pending' then
      new.message := old.message;
      new.proposed_price := old.proposed_price;
      new.estimated_duration_minutes := old.estimated_duration_minutes;
      new.note := old.note;
    end if;
    new.status := old.status;
  else
    new.status := old.status;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists before_request_application_update on public.request_applications;
create trigger before_request_application_update
  before update on public.request_applications
  for each row execute function public.protect_request_application_fields();

alter table public.request_applications enable row level security;

drop policy if exists "Client and applicant can view applications" on public.request_applications;
create policy "Client and applicant can view applications"
  on public.request_applications for select
  using (
    provider_id = auth.uid()
    or exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid())
  );

drop policy if exists "Providers can apply to open requests" on public.request_applications;
create policy "Providers can apply to open requests"
  on public.request_applications for insert
  with check (
    provider_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_provider = true)
    and exists (
      select 1 from public.requests r
      where r.id = request_id and r.status = 'open' and r.client_id <> auth.uid()
    )
  );

drop policy if exists "Client and applicant can update applications" on public.request_applications;
create policy "Client and applicant can update applications"
  on public.request_applications for update
  using (
    provider_id = auth.uid()
    or exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid())
  )
  with check (
    provider_id = auth.uid()
    or exists (select 1 from public.requests r where r.id = request_id and r.client_id = auth.uid())
  );

-- Fonction technique pour éviter une récursion infinie de policies : la
-- policy SELECT de "requests" a besoin de savoir si l'utilisateur a postulé
-- (table request_applications), mais les policies de request_applications
-- interrogent elles-mêmes "requests" (pour vérifier r.client_id). Une requête
-- directe des deux côtés provoque une boucle ("infinite recursion detected
-- in policy for relation requests", 42P17). Une fonction security definer
-- interroge request_applications en tant que propriétaire de la table (qui
-- n'est pas soumis à ses RLS), ce qui casse la boucle.
create or replace function public.has_applied_to_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.request_applications a
    where a.request_id = p_request_id and a.provider_id = auth.uid()
  );
$$;

-- Un prestataire voit une demande soit parce qu'elle est ouverte, soit parce
-- qu'il y a déjà postulé (utile une fois la demande passée en discussion).
drop policy if exists "Providers can view open requests or ones they applied to" on public.requests;
create policy "Providers can view open requests or ones they applied to"
  on public.requests for select
  using (
    status = 'open'
    or public.has_applied_to_request(requests.id)
  );

-- La visibilité des photos d'une demande suit celle de la demande elle-même
-- (client propriétaire, demande ouverte, ou déjà candidat sur cette demande).
drop policy if exists "Same visibility as the parent request" on public.request_photos;
create policy "Same visibility as the parent request"
  on public.request_photos for select
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id
        and (
          r.client_id = auth.uid()
          or r.status = 'open'
          or public.has_applied_to_request(r.id)
        )
    )
  );

-- ----------------------------------------------------------------------------
-- Table: booking_proposals
-- Représente à la fois un créneau proposé après candidature ET une
-- proposition directe d'un prestataire : les deux suivent le même circuit de
-- double validation (client puis prestataire) avant de devenir une
-- intervention confirmée.
-- ----------------------------------------------------------------------------
create table if not exists public.booking_proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests (id) on delete set null,
  application_id uuid references public.request_applications (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null default '',
  address text,
  client_phone text,
  conditions text,
  scheduled_date date not null,
  start_time time not null,
  duration_minutes integer not null default 60,
  price numeric(10, 2),
  status text not null default 'pending_client',
  client_validated_at timestamptz,
  client_validated_by uuid references public.profiles (id),
  provider_validated_at timestamptz,
  provider_validated_by uuid references public.profiles (id),
  intervention_id uuid references public.interventions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_proposals_distinct_people check (provider_id <> client_id),
  constraint booking_proposals_duration_positive check (duration_minutes > 0),
  constraint booking_proposals_status_valid check (
    status in (
      'pending_client', 'modification_requested', 'pending_provider',
      'confirmed', 'refused', 'cancelled'
    )
  ),
  constraint booking_proposals_category_valid check (
    category in (
      'menage', 'bricolage', 'jardinage', 'demenagement', 'reparation',
      'beaute_bien_etre', 'cours_particuliers', 'transport', 'evenementiel', 'autre'
    )
  )
);

comment on table public.booking_proposals is 'Proposition de créneau/prestation en attente de double validation (client puis prestataire) avant de devenir une intervention confirmée.';

create index if not exists booking_proposals_provider_id_idx on public.booking_proposals (provider_id);
create index if not exists booking_proposals_client_id_idx on public.booking_proposals (client_id);
create index if not exists booking_proposals_request_id_idx on public.booking_proposals (request_id);
create index if not exists booking_proposals_application_id_idx on public.booking_proposals (application_id);
create index if not exists booking_proposals_status_idx on public.booking_proposals (status);

-- Protège les champs selon qui agit, et n'autorise que les transitions de
-- statut légitimes pour chaque partie.
create or replace function public.protect_booking_proposal_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Laisse passer sans restriction les écritures internes de
  -- handle_booking_proposal_confirmed (fixer intervention_id, annuler les
  -- propositions concurrentes de la même négociation).
  if coalesce(current_setting('app.bypass_protection', true), 'false') = 'true' then
    new.updated_at := now();
    return new;
  end if;

  new.provider_id := old.provider_id;
  new.client_id := old.client_id;
  new.request_id := old.request_id;
  new.application_id := old.application_id;
  new.conversation_id := old.conversation_id;
  new.intervention_id := old.intervention_id;

  if auth.uid() = old.client_id and auth.uid() <> old.provider_id then
    new.title := old.title;
    new.category := old.category;
    new.description := old.description;
    new.address := old.address;
    new.client_phone := old.client_phone;
    new.conditions := old.conditions;
    new.scheduled_date := old.scheduled_date;
    new.start_time := old.start_time;
    new.duration_minutes := old.duration_minutes;
    new.price := old.price;
    new.provider_validated_at := old.provider_validated_at;
    new.provider_validated_by := old.provider_validated_by;

    if old.status <> 'pending_client'
       or new.status not in ('pending_provider', 'modification_requested', 'refused') then
      new.status := old.status;
      new.client_validated_at := old.client_validated_at;
      new.client_validated_by := old.client_validated_by;
    end if;
  elsif auth.uid() = old.provider_id then
    if old.status not in ('pending_client', 'modification_requested') then
      new.title := old.title;
      new.category := old.category;
      new.description := old.description;
      new.address := old.address;
      new.client_phone := old.client_phone;
      new.conditions := old.conditions;
      new.scheduled_date := old.scheduled_date;
      new.start_time := old.start_time;
      new.duration_minutes := old.duration_minutes;
      new.price := old.price;
    end if;

    new.client_validated_at := old.client_validated_at;
    new.client_validated_by := old.client_validated_by;

    if not (
      (old.status = 'pending_provider' and new.status = 'confirmed')
      or (old.status in ('pending_client', 'modification_requested', 'pending_provider') and new.status = 'cancelled')
      or (old.status = 'modification_requested' and new.status = 'pending_client')
      or (new.status = old.status)
    ) then
      new.status := old.status;
    end if;
  else
    new.status := old.status;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists before_booking_proposal_update on public.booking_proposals;
create trigger before_booking_proposal_update
  before update on public.booking_proposals
  for each row execute function public.protect_booking_proposal_fields();

-- Quand une proposition passe à 'confirmed' (validation finale du
-- prestataire) : re-vérifie qu'aucun conflit d'horaire n'est apparu entre
-- temps, crée l'intervention, annule les propositions concurrentes de la
-- même négociation, marque les autres candidatures "non retenue", fait
-- avancer la demande à 'confirmed', et notifie les deux parties.
create or replace function public.handle_booking_proposal_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_intervention_id uuid;
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    if exists (
      select 1 from public.interventions i
      where i.provider_id = new.provider_id
        and i.scheduled_date = new.scheduled_date
        and i.status <> 'cancelled'
        and (new.start_time, (new.start_time + (new.duration_minutes || ' minutes')::interval))
            overlaps
            (i.start_time, (i.start_time + (i.duration_minutes || ' minutes')::interval))
    ) then
      raise exception 'Ce créneau n''est plus disponible.';
    end if;

    insert into public.interventions (
      request_id, provider_id, client_id, title, category, description,
      address, client_phone, scheduled_date, start_time, duration_minutes, price, status
    ) values (
      new.request_id, new.provider_id, new.client_id, new.title, new.category, new.description,
      new.address, new.client_phone, new.scheduled_date, new.start_time, new.duration_minutes, new.price, 'confirmed'
    )
    returning id into new_intervention_id;

    -- Levée temporaire (durée de la transaction) de la protection de champs,
    -- pour permettre à cette cascade système d'écrire des lignes qui ne
    -- appartiennent pas forcément à l'utilisateur ayant déclenché l'action
    -- (ex: candidatures d'autres prestataires marquées "non retenue").
    perform set_config('app.bypass_protection', 'true', true);

    update public.booking_proposals
    set intervention_id = new_intervention_id
    where id = new.id;

    update public.booking_proposals
    set status = 'cancelled'
    where id <> new.id
      and status not in ('confirmed', 'cancelled', 'refused')
      and (
        (new.application_id is not null and application_id = new.application_id)
        or (
          new.application_id is null
          and request_id is null
          and provider_id = new.provider_id
          and client_id = new.client_id
        )
      );

    if new.request_id is not null then
      update public.request_applications
      set status = 'not_retained'
      where request_id = new.request_id
        and provider_id <> new.provider_id
        and status in ('pending', 'accepted_for_discussion');

      update public.requests
      set status = 'confirmed'
      where id = new.request_id;
    end if;

    insert into public.notifications (user_id, type, title, body, intervention_id)
    values
      (new.client_id, 'booking_confirmed', 'Prestation confirmée', new.title, new_intervention_id),
      (new.provider_id, 'booking_confirmed', 'Prestation confirmée', new.title, new_intervention_id);
  end if;

  return new;
end;
$$;

drop trigger if exists after_booking_proposal_confirmed on public.booking_proposals;
create trigger after_booking_proposal_confirmed
  after update on public.booking_proposals
  for each row execute function public.handle_booking_proposal_confirmed();

alter table public.booking_proposals enable row level security;

drop policy if exists "Participants can view their booking proposals" on public.booking_proposals;
create policy "Participants can view their booking proposals"
  on public.booking_proposals for select
  using (provider_id = auth.uid() or client_id = auth.uid());

drop policy if exists "Provider can create booking proposals" on public.booking_proposals;
create policy "Provider can create booking proposals"
  on public.booking_proposals for insert
  with check (
    provider_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_provider = true)
  );

drop policy if exists "Participants can update their booking proposals" on public.booking_proposals;
create policy "Participants can update their booking proposals"
  on public.booking_proposals for update
  using (provider_id = auth.uid() or client_id = auth.uid())
  with check (provider_id = auth.uid() or client_id = auth.uid());

-- ----------------------------------------------------------------------------
-- notifications : nouveaux types pour candidatures, propositions et messages
-- ----------------------------------------------------------------------------
-- La contrainte n'est volontairement PAS recréée ici. Elle l'était avec la
-- liste connue à la Phase 9, qui ignore les types du covoiturage ajoutés en
-- Phase 12. Rejouer ce fichier sur une base contenant déjà des notifications
-- de covoiturage échouait donc à cet endroit précis :
--   "check constraint notifications_type_valid is violated by some row"
-- La contrainte intermédiaire était plus étroite que les données réelles.
-- La liste définitive, qui couvre toutes les phases, est posée en Phase 12.
alter table public.notifications drop constraint if exists notifications_type_valid;

-- Un participant d'une candidature peut notifier l'autre partie (utilisé par
-- les actions applicatives : nouvelle candidature, acceptation, refus...).
drop policy if exists "Participants can notify each other about applications" on public.notifications;
create policy "Participants can notify each other about applications"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.request_applications a
      join public.requests r on r.id = a.request_id
      where (a.provider_id = user_id and r.client_id = auth.uid())
         or (r.client_id = user_id and a.provider_id = auth.uid())
    )
  );

-- Idem pour les propositions de créneau.
drop policy if exists "Participants can notify each other about proposals" on public.notifications;
create policy "Participants can notify each other about proposals"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.booking_proposals bp
      where (bp.provider_id = auth.uid() and bp.client_id = user_id)
         or (bp.client_id = auth.uid() and bp.provider_id = user_id)
    )
  );

-- Idem pour un nouveau message dans une conversation existante.
drop policy if exists "Participants can notify each other about messages" on public.notifications;
create policy "Participants can notify each other about messages"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.conversations c
      where (c.participant_one = auth.uid() and c.participant_two = user_id)
         or (c.participant_two = auth.uid() and c.participant_one = user_id)
    )
  );

-- ----------------------------------------------------------------------------
-- Bucket de stockage privé pour les photos de demande (même logique que les
-- photos d'intervention : accès restreint à ceux qui peuvent voir la demande).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('request-photos', 'request-photos', false)
on conflict (id) do nothing;

drop policy if exists "Same visibility as parent request for storage" on storage.objects;
create policy "Same visibility as parent request for storage"
  on storage.objects for select
  using (
    bucket_id = 'request-photos'
    and exists (
      select 1 from public.requests r
      where r.id::text = (storage.foldername(name))[1]
        and (
          r.client_id = auth.uid()
          or r.status = 'open'
          or public.has_applied_to_request(r.id)
        )
    )
  );

drop policy if exists "Client can upload request photos" on storage.objects;
create policy "Client can upload request photos"
  on storage.objects for insert
  with check (
    bucket_id = 'request-photos'
    and exists (
      select 1 from public.requests r
      where r.id::text = (storage.foldername(name))[1] and r.client_id = auth.uid()
    )
  );

drop policy if exists "Client can delete request photos" on storage.objects;
create policy "Client can delete request photos"
  on storage.objects for delete
  using (
    bucket_id = 'request-photos'
    and exists (
      select 1 from public.requests r
      where r.id::text = (storage.foldername(name))[1] and r.client_id = auth.uid()
    )
  );

-- ============================================================================
-- Phase 10 : Back-office de modération (administrateurs)
-- ============================================================================
-- Ajoute un rôle administrateur (is_admin), protégé comme phone_verified /
-- identity_verified (uniquement modifiable en service_role, jamais par
-- l'utilisateur lui-même). Un administrateur peut consulter et traiter les
-- signalements (table reports, déjà en place depuis la Phase 6), ainsi que
-- voir le contenu ciblé (profil, service ou message) même s'il n'y aurait
-- normalement pas accès.
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Redéfinit le trigger de la Phase 1 pour protéger aussi is_admin.
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
    new.is_admin := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Fonction technique (même logique que has_applied_to_request) : évite une
-- récursion RLS si une policy sur profiles devait un jour vérifier is_admin,
-- et permet aux policies d'autres tables de vérifier le statut admin sans
-- dépendre des policies SELECT de profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

drop policy if exists "Admins can view all reports" on public.reports;
create policy "Admins can view all reports"
  on public.reports for select
  using (public.is_admin());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

-- Un admin doit pouvoir voir/archiver un service signalé même s'il est déjà
-- archivé ou n'appartient pas à l'admin.
drop policy if exists "Admins can view all services" on public.services;
create policy "Admins can view all services"
  on public.services for select
  using (public.is_admin());

drop policy if exists "Admins can update any service" on public.services;
create policy "Admins can update any service"
  on public.services for update
  using (public.is_admin())
  with check (public.is_admin());

-- Un admin doit pouvoir lire un message signalé même s'il n'est pas
-- participant de la conversation.
drop policy if exists "Admins can view all messages" on public.messages;
create policy "Admins can view all messages"
  on public.messages for select
  using (public.is_admin());

-- ============================================================================
-- Phase 11 : Rappel automatique avant intervention
-- ============================================================================
-- reminder_sent suit si le rappel du jour précédent a déjà été envoyé pour
-- cette intervention, afin que la tâche planifiée (Vercel Cron, une fois par
-- jour) ne notifie jamais deux fois pour la même intervention. Remis à false
-- automatiquement par rescheduleIntervention en cas de reprogrammation.
-- Écrit uniquement par le serveur (route /api/cron/reminders, via la clé
-- service_role qui contourne les RLS) : aucune policy supplémentaire requise,
-- les policies existantes sur interventions/notifications continuent de
-- s'appliquer normalement aux utilisateurs.
-- ----------------------------------------------------------------------------
alter table public.interventions add column if not exists reminder_sent boolean not null default false;
create index if not exists interventions_reminder_pending_idx
  on public.interventions (scheduled_date)
  where status = 'confirmed' and reminder_sent = false;

-- ============================================================================
-- Phase 12 : Covoiturage avec paiement en ligne (Stripe Connect)
-- ============================================================================
-- Un conducteur publie un trajet (ville de départ/arrivée, date, places,
-- prix par place). Un passager réserve une ou plusieurs places et paie sur
-- l'application ; l'argent est reversé au conducteur via Stripe Connect,
-- moins une commission plateforme. Les places sont réservées de façon
-- atomique (verrouillage de ligne) au moment de la réservation, pas au
-- moment du paiement, pour ne jamais survendre un trajet.

-- ----------------------------------------------------------------------------
-- Table: stripe_accounts
-- Compte Stripe Connect (Express) d'un conducteur, permettant de recevoir
-- des paiements. payouts_enabled/details_submitted ne sont mis à jour que
-- par le webhook Stripe (service_role, contourne les RLS) : jamais par
-- l'utilisateur lui-même.
-- ----------------------------------------------------------------------------
create table if not exists public.stripe_accounts (
  id uuid primary key references public.profiles (id) on delete cascade,
  stripe_account_id text not null unique,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_accounts enable row level security;

drop policy if exists "Users can view own stripe account" on public.stripe_accounts;
create policy "Users can view own stripe account"
  on public.stripe_accounts for select
  using (id = auth.uid());

drop policy if exists "Users can create own stripe account" on public.stripe_accounts;
create policy "Users can create own stripe account"
  on public.stripe_accounts for insert
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- Table: carpool_trips
-- ----------------------------------------------------------------------------
create table if not exists public.carpool_trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles (id) on delete cascade,
  origin_city text not null,
  destination_city text not null,
  departure_date date not null,
  departure_time time not null,
  seats_total integer not null,
  seats_available integer not null,
  price_per_seat numeric(10, 2) not null,
  description text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carpool_trips_seats_positive check (seats_total > 0),
  constraint carpool_trips_seats_available_range check (seats_available between 0 and seats_total),
  constraint carpool_trips_price_nonnegative check (price_per_seat >= 0),
  constraint carpool_trips_status_valid check (status in ('open', 'full', 'completed', 'cancelled'))
);

create index if not exists carpool_trips_driver_id_idx on public.carpool_trips (driver_id);
create index if not exists carpool_trips_departure_date_idx on public.carpool_trips (departure_date);
create index if not exists carpool_trips_status_idx on public.carpool_trips (status);

create or replace function public.handle_carpool_trip_update()
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

drop trigger if exists before_carpool_trip_update on public.carpool_trips;
create trigger before_carpool_trip_update
  before update on public.carpool_trips
  for each row execute function public.handle_carpool_trip_update();

-- ----------------------------------------------------------------------------
-- Table: carpool_bookings
-- ----------------------------------------------------------------------------
create table if not exists public.carpool_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.carpool_trips (id) on delete cascade,
  passenger_id uuid not null references public.profiles (id) on delete cascade,
  seats_booked integer not null,
  price_total numeric(10, 2) not null,
  platform_fee numeric(10, 2) not null default 0,
  status text not null default 'pending_payment',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carpool_bookings_seats_positive check (seats_booked > 0),
  constraint carpool_bookings_status_valid check (
    status in ('pending_payment', 'paid', 'cancelled', 'refunded')
  )
);

create index if not exists carpool_bookings_trip_id_idx on public.carpool_bookings (trip_id);
create index if not exists carpool_bookings_passenger_id_idx on public.carpool_bookings (passenger_id);

create or replace function public.handle_carpool_booking_update()
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

drop trigger if exists before_carpool_booking_update on public.carpool_bookings;
create trigger before_carpool_booking_update
  before update on public.carpool_bookings
  for each row execute function public.handle_carpool_booking_update();

-- Fonction technique (même principe que has_applied_to_request) : évite la
-- récursion RLS entre carpool_trips et carpool_bookings.
create or replace function public.is_trip_passenger(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.carpool_bookings b
    where b.trip_id = p_trip_id
      and b.passenger_id = auth.uid()
      and b.status in ('pending_payment', 'paid')
  );
$$;

create or replace function public.is_trip_driver(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.carpool_trips t
    where t.id = p_trip_id and t.driver_id = auth.uid()
  );
$$;

-- Les RLS de stripe_accounts réservent chaque ligne à son propriétaire, ce qui
-- est voulu : personne ne doit pouvoir parcourir les comptes de paiement des
-- autres. Mais le passager qui réserve a besoin du compte du conducteur pour
-- que Stripe lui reverse l'argent (destination charge). Cette fonction expose
-- ce strict minimum, et uniquement pour le trajet demandé.
create or replace function public.get_trip_payout_account(p_trip_id uuid)
returns table (stripe_account_id text, payouts_enabled boolean)
language sql
stable
security definer
set search_path = public
as $$
  select sa.stripe_account_id, sa.payouts_enabled
  from public.carpool_trips t
  join public.stripe_accounts sa on sa.id = t.driver_id
  where t.id = p_trip_id;
$$;

comment on function public.get_trip_payout_account is 'Compte de paiement du conducteur d''un trajet, pour créer le paiement Stripe côté serveur. Contourne volontairement les RLS de stripe_accounts, en se limitant au trajet passé en argument.';

alter table public.carpool_trips enable row level security;

drop policy if exists "Trips are viewable by everyone" on public.carpool_trips;
create policy "Trips are viewable by everyone"
  on public.carpool_trips for select
  using (
    status <> 'cancelled'
    or driver_id = auth.uid()
    or public.is_trip_passenger(id)
  );

-- Publier un trajet est ouvert à tout compte connecté, prestataire ou non :
-- proposer des places dans sa voiture n'est pas une prestation de service.
-- L'ancienne policy réservée aux prestataires est explicitement supprimée.
drop policy if exists "Providers can publish trips" on public.carpool_trips;
drop policy if exists "Any authenticated user can publish trips" on public.carpool_trips;
create policy "Any authenticated user can publish trips"
  on public.carpool_trips for insert
  with check (driver_id = auth.uid());

drop policy if exists "Drivers can update own trips" on public.carpool_trips;
create policy "Drivers can update own trips"
  on public.carpool_trips for update
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

alter table public.carpool_bookings enable row level security;

drop policy if exists "Passenger and driver can view bookings" on public.carpool_bookings;
create policy "Passenger and driver can view bookings"
  on public.carpool_bookings for select
  using (passenger_id = auth.uid() or public.is_trip_driver(trip_id));

-- L'insertion normale (with check passenger_id = auth.uid()) n'est là qu'en
-- défense en profondeur : en pratique, toute réservation passe par la
-- fonction create_carpool_booking (security definer) ci-dessous, qui gère
-- l'atomicité de la décrémentation des places.
drop policy if exists "Passengers can create own bookings" on public.carpool_bookings;
create policy "Passengers can create own bookings"
  on public.carpool_bookings for insert
  with check (passenger_id = auth.uid());

-- Un passager ne peut annuler (statut -> cancelled) que sa propre réservation
-- tant qu'elle n'est pas encore payée ; toute autre modification passe par
-- le webhook Stripe (service_role, contourne les RLS).
drop policy if exists "Passengers can cancel own pending booking" on public.carpool_bookings;
create policy "Passengers can cancel own pending booking"
  on public.carpool_bookings for update
  using (passenger_id = auth.uid() and status = 'pending_payment')
  with check (passenger_id = auth.uid() and status = 'cancelled');

-- ----------------------------------------------------------------------------
-- Réservation atomique : verrouille le trajet, vérifie les places restantes,
-- les décrémente, et crée la réservation en une seule transaction (empêche
-- deux passagers de réserver simultanément la ou les dernières places).
-- ----------------------------------------------------------------------------
create or replace function public.create_carpool_booking(p_trip_id uuid, p_seats integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip record;
  v_price_total numeric(10, 2);
  v_platform_fee numeric(10, 2);
  v_booking_id uuid;
begin
  if p_seats is null or p_seats < 1 then
    raise exception 'Nombre de places invalide.';
  end if;

  select * into v_trip from public.carpool_trips where id = p_trip_id for update;

  if v_trip is null then
    raise exception 'Trajet introuvable.';
  end if;

  if v_trip.driver_id = auth.uid() then
    raise exception 'Vous ne pouvez pas réserver votre propre trajet.';
  end if;

  if v_trip.status <> 'open' then
    raise exception 'Ce trajet n''accepte plus de réservations.';
  end if;

  if v_trip.seats_available < p_seats then
    raise exception 'Il ne reste pas assez de places sur ce trajet.';
  end if;

  v_price_total := v_trip.price_per_seat * p_seats;
  v_platform_fee := round(v_price_total * 0.10, 2);

  update public.carpool_trips
  set
    seats_available = seats_available - p_seats,
    status = case when seats_available - p_seats <= 0 then 'full' else status end
  where id = p_trip_id;

  insert into public.carpool_bookings (
    trip_id, passenger_id, seats_booked, price_total, platform_fee, status
  ) values (
    p_trip_id, auth.uid(), p_seats, v_price_total, v_platform_fee, 'pending_payment'
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Annulation d'une réservation non payée : restitue les places au trajet.
-- Appelée par le passager (bouton "Annuler") ou par le webhook Stripe quand
-- une session de paiement expire sans avoir été payée.
-- ----------------------------------------------------------------------------
create or replace function public.cancel_carpool_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
begin
  select * into v_booking from public.carpool_bookings where id = p_booking_id for update;

  if v_booking is null or v_booking.status <> 'pending_payment' then
    return;
  end if;

  -- auth.uid() vaut null quand la fonction est appelée par le webhook Stripe
  -- (clé service_role, aucun utilisateur connecté) : c'est le cas qui permet de
  -- libérer automatiquement une session de paiement expirée. Sinon, seuls le
  -- passager concerné et le conducteur du trajet peuvent annuler — ce dernier
  -- parce qu'annuler son trajet doit aussi solder les réservations non payées.
  if auth.uid() is not null
     and v_booking.passenger_id <> auth.uid()
     and not exists (
       select 1 from public.carpool_trips t
       where t.id = v_booking.trip_id and t.driver_id = auth.uid()
     ) then
    raise exception 'Non autorisé.';
  end if;

  update public.carpool_bookings set status = 'cancelled' where id = p_booking_id;

  update public.carpool_trips
  set
    seats_available = least(seats_total, seats_available + v_booking.seats_booked),
    status = case when status = 'full' then 'open' else status end
  where id = v_booking.trip_id;
end;
$$;

comment on function public.cancel_carpool_booking is 'Annule une réservation non payée et restitue ses places au trajet. Appelable par le passager (via RLS) ou par le webhook Stripe (service_role) en cas d''expiration de la session de paiement.';

-- ----------------------------------------------------------------------------
-- Remboursement d'une réservation déjà payée : bascule le statut et restitue
-- les places. Le remboursement de l'argent lui-même est fait côté application
-- via l'API Stripe AVANT l'appel de cette fonction : on ne marque jamais
-- "refunded" une réservation dont l'argent n'est pas effectivement reparti.
-- Autorisé au passager (qui se désiste) comme au conducteur (qui annule son
-- trajet) ; les policies d'UPDATE de carpool_bookings ne couvrent ni l'un ni
-- l'autre pour un statut 'paid', d'où le security definer.
-- ----------------------------------------------------------------------------
create or replace function public.refund_carpool_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_driver_id uuid;
begin
  select * into v_booking from public.carpool_bookings where id = p_booking_id for update;

  if v_booking is null or v_booking.status <> 'paid' then
    return;
  end if;

  select driver_id into v_driver_id from public.carpool_trips where id = v_booking.trip_id;

  -- auth.uid() vaut null quand l'appel vient du serveur (service_role).
  if auth.uid() is not null
     and v_booking.passenger_id <> auth.uid()
     and v_driver_id is distinct from auth.uid() then
    raise exception 'Non autorisé.';
  end if;

  update public.carpool_bookings set status = 'refunded' where id = p_booking_id;

  update public.carpool_trips
  set
    seats_available = least(seats_total, seats_available + v_booking.seats_booked),
    status = case when status = 'full' then 'open' else status end
  where id = v_booking.trip_id;
end;
$$;

comment on function public.refund_carpool_booking is 'Marque une réservation payée comme remboursée et restitue ses places. À n''appeler qu''après un remboursement Stripe effectif.';

-- Le webhook Stripe (service_role, contourne les RLS) notifie conducteur et
-- passager quand un paiement de covoiturage est confirmé.
alter table public.notifications drop constraint if exists notifications_type_valid;
alter table public.notifications add constraint notifications_type_valid check (
  type in (
    'new_request', 'request_accepted', 'appointment_changed', 'upcoming_intervention',
    'cancelled', 'completed', 'validation_requested', 'client_validated', 'client_problem',
    'new_application', 'application_accepted', 'application_refused', 'new_message',
    'new_slot_proposal', 'slot_accepted', 'slot_refused', 'modification_requested',
    'provider_proposal', 'booking_confirmed', 'booking_cancelled',
    'carpool_booking_paid', 'carpool_trip_cancelled', 'carpool_booking_refunded'
  )
);

-- Permet au conducteur de notifier ses passagers (et inversement) sans passer
-- par le service_role : la relation est vérifiée via une réservation commune.
drop policy if exists "Carpool participants can notify each other" on public.notifications;
create policy "Carpool participants can notify each other"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.carpool_bookings b
      join public.carpool_trips t on t.id = b.trip_id
      where (t.driver_id = auth.uid() and b.passenger_id = user_id)
         or (b.passenger_id = auth.uid() and t.driver_id = user_id)
    )
  );
