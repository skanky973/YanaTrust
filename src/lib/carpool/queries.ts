import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CarpoolTrip, CarpoolBooking, StripeAccount } from "@/lib/supabase/database.types";

export type TripWithDriver = CarpoolTrip & {
  driver: { id: string; first_name: string; last_name: string } | null;
};

export type BookingWithTrip = CarpoolBooking & {
  trip: TripWithDriver | null;
};

export type BookingWithPassenger = CarpoolBooking & {
  passenger: { id: string; first_name: string; last_name: string } | null;
};

const TRIP_WITH_DRIVER_SELECT =
  "*, driver:profiles!carpool_trips_driver_id_fkey(id, first_name, last_name)";

export async function getOpenTrips({
  origin,
  destination,
}: { origin?: string; destination?: string } = {}): Promise<TripWithDriver[]> {
  const supabase = await createClient();

  let query = supabase
    .from("carpool_trips")
    .select(TRIP_WITH_DRIVER_SELECT)
    .eq("status", "open")
    .gte("departure_date", new Date().toISOString().slice(0, 10))
    .order("departure_date", { ascending: true });

  if (origin) query = query.ilike("origin_city", `%${origin}%`);
  if (destination) query = query.ilike("destination_city", `%${destination}%`);

  const { data, error } = await query;

  if (error) {
    console.error("getOpenTrips:", error.message);
    return [];
  }

  return data as unknown as TripWithDriver[];
}

export async function getTripById(id: string): Promise<TripWithDriver | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("carpool_trips")
    .select(TRIP_WITH_DRIVER_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error("getTripById:", error.message);
    return null;
  }

  return data as unknown as TripWithDriver;
}

export async function getMyTrips(): Promise<CarpoolTrip[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("carpool_trips")
    .select("*")
    .eq("driver_id", user.id)
    .order("departure_date", { ascending: false });

  if (error) {
    console.error("getMyTrips:", error.message);
    return [];
  }

  return data;
}

export async function getBookingsForTrip(tripId: string): Promise<BookingWithPassenger[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("carpool_bookings")
    .select("*, passenger:profiles!carpool_bookings_passenger_id_fkey(id, first_name, last_name)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getBookingsForTrip:", error.message);
    return [];
  }

  return data as unknown as BookingWithPassenger[];
}

export async function getMyBookings(): Promise<BookingWithTrip[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("carpool_bookings")
    .select(`*, trip:carpool_trips(${TRIP_WITH_DRIVER_SELECT})`)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyBookings:", error.message);
    return [];
  }

  return data as unknown as BookingWithTrip[];
}

export async function getMyBookingForTrip(tripId: string): Promise<CarpoolBooking | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("carpool_bookings")
    .select("*")
    .eq("trip_id", tripId)
    .eq("passenger_id", user.id)
    .in("status", ["pending_payment", "paid"])
    .maybeSingle();

  return data;
}

export async function getMyStripeAccount(): Promise<StripeAccount | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("stripe_accounts")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}
