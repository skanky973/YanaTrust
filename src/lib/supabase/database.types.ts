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
          city: string | null;
          service_area: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_provider: boolean;
          phone_verified: boolean;
          identity_verified: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          city?: string | null;
          service_area?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_provider?: boolean;
          phone_verified?: boolean;
          identity_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          city?: string | null;
          service_area?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_provider?: boolean;
          phone_verified?: boolean;
          identity_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_phones: {
        Row: { id: string; phone: string | null; updated_at: string };
        Insert: { id: string; phone?: string | null; updated_at?: string };
        Update: { id?: string; phone?: string | null; updated_at?: string };
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
          sender_id: string | null;
          content: string;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          content: string;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string | null;
          content?: string;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          provider_id: string;
          author_id: string;
          rating: number;
          comment: string | null;
          punctuality: number | null;
          quality: number | null;
          communication: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          author_id: string;
          rating: number;
          comment?: string | null;
          punctuality?: number | null;
          quality?: number | null;
          communication?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          author_id?: string;
          rating?: number;
          comment?: string | null;
          punctuality?: number | null;
          quality?: number | null;
          communication?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      favorite_providers: {
        Row: { user_id: string; provider_id: string; created_at: string };
        Insert: {
          user_id: string;
          provider_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          provider_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      favorite_services: {
        Row: { user_id: string; service_id: string; created_at: string };
        Insert: {
          user_id: string;
          service_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          service_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: string;
          target_id?: string;
          reason?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      service_photos: {
        Row: {
          id: string;
          service_id: string;
          path: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          path: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          path?: string;
          url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      interventions: {
        Row: {
          id: string;
          request_id: string | null;
          service_id: string | null;
          provider_id: string;
          client_id: string;
          title: string;
          category: string;
          description: string;
          address: string | null;
          client_phone: string | null;
          scheduled_date: string;
          start_time: string;
          duration_minutes: number;
          price: number | null;
          final_price: number | null;
          status: string;
          provider_note: string | null;
          work_notes: string | null;
          materials_used: string | null;
          needs_followup: boolean;
          client_validated_at: string | null;
          client_reported_problem: boolean;
          client_comment: string | null;
          client_rating: number | null;
          reminder_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          service_id?: string | null;
          provider_id: string;
          client_id: string;
          title: string;
          category: string;
          description?: string;
          address?: string | null;
          client_phone?: string | null;
          scheduled_date: string;
          start_time: string;
          duration_minutes?: number;
          price?: number | null;
          final_price?: number | null;
          status?: string;
          provider_note?: string | null;
          work_notes?: string | null;
          materials_used?: string | null;
          needs_followup?: boolean;
          client_validated_at?: string | null;
          client_reported_problem?: boolean;
          client_comment?: string | null;
          client_rating?: number | null;
          reminder_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          service_id?: string | null;
          provider_id?: string;
          client_id?: string;
          title?: string;
          category?: string;
          description?: string;
          address?: string | null;
          client_phone?: string | null;
          scheduled_date?: string;
          start_time?: string;
          duration_minutes?: number;
          price?: number | null;
          final_price?: number | null;
          status?: string;
          provider_note?: string | null;
          work_notes?: string | null;
          materials_used?: string | null;
          needs_followup?: boolean;
          client_validated_at?: string | null;
          client_reported_problem?: boolean;
          client_comment?: string | null;
          client_rating?: number | null;
          reminder_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      intervention_status_history: {
        Row: {
          id: string;
          intervention_id: string;
          from_status: string | null;
          to_status: string;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          intervention_id: string;
          from_status?: string | null;
          to_status: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          intervention_id?: string;
          from_status?: string | null;
          to_status?: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      intervention_photos: {
        Row: {
          id: string;
          intervention_id: string;
          type: string;
          path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          intervention_id: string;
          type: string;
          path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          intervention_id?: string;
          type?: string;
          path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      provider_weekly_availability: {
        Row: {
          id: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
        };
        Relationships: [];
      };
      provider_unavailable_dates: {
        Row: {
          id: string;
          provider_id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          date?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          intervention_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          intervention_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          intervention_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      request_photos: {
        Row: { id: string; request_id: string; path: string; created_at: string };
        Insert: { id?: string; request_id: string; path: string; created_at?: string };
        Update: { id?: string; request_id?: string; path?: string; created_at?: string };
        Relationships: [];
      };
      request_applications: {
        Row: {
          id: string;
          request_id: string;
          provider_id: string;
          conversation_id: string | null;
          message: string;
          proposed_price: number | null;
          estimated_duration_minutes: number | null;
          note: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          provider_id: string;
          conversation_id?: string | null;
          message?: string;
          proposed_price?: number | null;
          estimated_duration_minutes?: number | null;
          note?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          provider_id?: string;
          conversation_id?: string | null;
          message?: string;
          proposed_price?: number | null;
          estimated_duration_minutes?: number | null;
          note?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      booking_proposals: {
        Row: {
          id: string;
          request_id: string | null;
          application_id: string | null;
          conversation_id: string | null;
          provider_id: string;
          client_id: string;
          title: string;
          category: string;
          description: string;
          address: string | null;
          client_phone: string | null;
          conditions: string | null;
          scheduled_date: string;
          start_time: string;
          duration_minutes: number;
          price: number | null;
          status: string;
          client_validated_at: string | null;
          client_validated_by: string | null;
          provider_validated_at: string | null;
          provider_validated_by: string | null;
          intervention_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          application_id?: string | null;
          conversation_id?: string | null;
          provider_id: string;
          client_id: string;
          title: string;
          category: string;
          description?: string;
          address?: string | null;
          client_phone?: string | null;
          conditions?: string | null;
          scheduled_date: string;
          start_time: string;
          duration_minutes?: number;
          price?: number | null;
          status?: string;
          client_validated_at?: string | null;
          client_validated_by?: string | null;
          provider_validated_at?: string | null;
          provider_validated_by?: string | null;
          intervention_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          application_id?: string | null;
          conversation_id?: string | null;
          provider_id?: string;
          client_id?: string;
          title?: string;
          category?: string;
          description?: string;
          address?: string | null;
          client_phone?: string | null;
          conditions?: string | null;
          scheduled_date?: string;
          start_time?: string;
          duration_minutes?: number;
          price?: number | null;
          status?: string;
          client_validated_at?: string | null;
          client_validated_by?: string | null;
          provider_validated_at?: string | null;
          provider_validated_by?: string | null;
          intervention_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_accounts: {
        Row: {
          id: string;
          stripe_account_id: string;
          payouts_enabled: boolean;
          details_submitted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          stripe_account_id: string;
          payouts_enabled?: boolean;
          details_submitted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stripe_account_id?: string;
          payouts_enabled?: boolean;
          details_submitted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      carpool_trips: {
        Row: {
          id: string;
          driver_id: string;
          origin_city: string;
          destination_city: string;
          departure_date: string;
          departure_time: string;
          seats_total: number;
          seats_available: number;
          price_per_seat: number;
          description: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          origin_city: string;
          destination_city: string;
          departure_date: string;
          departure_time: string;
          seats_total: number;
          seats_available?: number;
          price_per_seat: number;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          origin_city?: string;
          destination_city?: string;
          departure_date?: string;
          departure_time?: string;
          seats_total?: number;
          seats_available?: number;
          price_per_seat?: number;
          description?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      carpool_bookings: {
        Row: {
          id: string;
          trip_id: string;
          passenger_id: string;
          seats_booked: number;
          price_total: number;
          platform_fee: number;
          status: string;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          passenger_id: string;
          seats_booked: number;
          price_total: number;
          platform_fee?: number;
          status?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          passenger_id?: string;
          seats_booked?: number;
          price_total?: number;
          platform_fee?: number;
          status?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_carpool_booking: {
        Args: { p_trip_id: string; p_seats: number };
        Returns: string;
      };
      cancel_carpool_booking: {
        Args: { p_booking_id: string };
        Returns: undefined;
      };
      refund_carpool_booking: {
        Args: { p_booking_id: string };
        Returns: undefined;
      };
      get_trip_payout_account: {
        Args: { p_trip_id: string };
        Returns: { stripe_account_id: string; payouts_enabled: boolean }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProfilePhone = Database["public"]["Tables"]["profile_phones"]["Row"];

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

export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ServicePhoto = Database["public"]["Tables"]["service_photos"]["Row"];

export type Intervention = Database["public"]["Tables"]["interventions"]["Row"];
export type InterventionInsert =
  Database["public"]["Tables"]["interventions"]["Insert"];
export type InterventionUpdate =
  Database["public"]["Tables"]["interventions"]["Update"];
export type InterventionStatusHistory =
  Database["public"]["Tables"]["intervention_status_history"]["Row"];
export type InterventionPhoto =
  Database["public"]["Tables"]["intervention_photos"]["Row"];
export type ProviderWeeklyAvailability =
  Database["public"]["Tables"]["provider_weekly_availability"]["Row"];
export type ProviderUnavailableDate =
  Database["public"]["Tables"]["provider_unavailable_dates"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type RequestPhoto = Database["public"]["Tables"]["request_photos"]["Row"];
export type RequestApplication =
  Database["public"]["Tables"]["request_applications"]["Row"];
export type BookingProposal =
  Database["public"]["Tables"]["booking_proposals"]["Row"];

export type StripeAccount = Database["public"]["Tables"]["stripe_accounts"]["Row"];
export type CarpoolTrip = Database["public"]["Tables"]["carpool_trips"]["Row"];
export type CarpoolBooking = Database["public"]["Tables"]["carpool_bookings"]["Row"];
