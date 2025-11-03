import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";
import { UserInsertInterface } from "@/users/domain/interfaces/UserInsert.interface";
import { UserInterface } from "@/users/domain/interfaces/User.interface";

import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class UserRepository implements UserRepositoryInterface {
  private readonly client = new SupabaseService().getClient();

  constructor() {
    this.client = new SupabaseService().getClient();
  }

  async getUsers(): Promise<UserInterface[]> {
    const { data, error } = await this.client.from("users").select("*");

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    return data ?? [];
  }

  async insertUser(user: UserInsertInterface): Promise<UserInterface> {
    const { data, error } = await this.client
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) {
      if (error.message.includes("duplicate key")) {
        const existing = await this.client
          .from("users")
          .select("*")
          .eq("phone", user.phone)
          .single();
        if (existing.data) return existing.data;
      }
      throw new Error(error.message);
    }

    return data;
  }

  async findByPhone(phone: string): Promise<UserInterface | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user by phone: ${error.message}`);
    }

    return data ?? null;
  }

  async findByUserId(userId: string): Promise<UserInterface | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Error fetching user by user_id: ${error.message}`);
    }

    return data ?? null;
  }
}
