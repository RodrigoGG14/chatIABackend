import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";
import { UserInterface } from "@/users/domain/interfaces/User.interface";
import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class UserRepository implements UserRepositoryInterface {
  private client;

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
}
