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
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          category: string;
          description: string;
          price_from: number | null;
          city: string | null;
          service_area: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          category: string;
          description?: string;
          price_from?: number | null;
          city?: string | null;
          service_area?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          category?: string;
          description?: string;
          price_from?: number | null;
          city?: string | null;
          service_area?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          category: string;
          description: string;
          budget: number | null;
          city: string | null;
          desired_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          category: string;
          description?: string;
          budget?: number | null;
          city?: string | null;
          desired_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          category?: string;
          description?: string;
          budget?: number | null;
          city?: string | null;
          desired_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          participant_one: string;
          participant_two: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_one: string;
          participant_two: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_one?: string;
          participant_two?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
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

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export type ServiceRequest = Database["public"]["Tables"]["requests"]["Row"];
export type ServiceRequestInsert =
  Database["public"]["Tables"]["requests"]["Insert"];
export type ServiceRequestUpdate =
  Database["public"]["Tables"]["requests"]["Update"];

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
