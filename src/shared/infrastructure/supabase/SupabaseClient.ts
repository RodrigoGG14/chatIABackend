import { Database } from "../../../shared/infrastructure/supabase/database";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Supabase URL o Service Role Key no definidos en .env");
    }

    this.client = createClient<Database>(url, key);
  }

  getClient(): SupabaseClient<Database> {
    return this.client;
  }
}
