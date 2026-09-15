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
