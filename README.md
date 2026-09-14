# YanaTrust

Plateforme locale de services — Saint-Laurent-du-Maroni, Guyane.
**Les services d'ici, en toute confiance.**

## Statut

Phase 1 — Authentification + profils Supabase.

## Démarrage

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL du projet, exécuter le contenu de [supabase/schema.sql](supabase/schema.sql).
3. Copier `.env.local.example` en `.env.local` et renseigner :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Project Settings > API dans Supabase)
4. Dans Supabase, Authentication > URL Configuration : ajouter `http://localhost:3000/auth/confirm` aux Redirect URLs autorisées (et l'équivalent en production).
5. Installer les dépendances puis lancer le serveur :

```bash
npm install
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Structure

- `supabase/schema.sql` — schéma de base de données (source de vérité), RLS incluses.
- `src/lib/supabase/` — clients Supabase (navigateur, serveur, middleware/proxy).
- `src/lib/profiles/queries.ts` — accès aux données profil (lecture).
- `src/app/*/actions.ts` — Server Actions (écriture : inscription, connexion, mise à jour du profil).
- `src/components/` — composants UI, formulaires d'authentification et de profil.
