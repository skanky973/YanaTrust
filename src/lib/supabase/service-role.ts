import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Client avec la clé service_role : contourne totalement les RLS. Réservé
// aux tâches serveur-à-serveur sans utilisateur connecté (ex: la tâche
// planifiée de rappel avant intervention). Ne jamais importer ce fichier
// depuis un Server Action ou un composant exposé à une requête utilisateur.
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
