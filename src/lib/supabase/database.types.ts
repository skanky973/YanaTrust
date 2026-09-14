// Types générés manuellement à partir de supabase/schema.sql.
// À remplacer par `supabase gen types typescript` une fois le projet Supabase
// lié en CLI (npx supabase login && npx supabase link).

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          city: string | null;
          service_area: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_provider: boolean;
          phone_verified: boolean;
          identity_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          city?: string | null;
          service_area?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_provider?: boolean;
          phone_verified?: boolean;
          identity_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          city?: string | null;
          service_area?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_provider?: boolean;
          phone_verified?: boolean;
          identity_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
