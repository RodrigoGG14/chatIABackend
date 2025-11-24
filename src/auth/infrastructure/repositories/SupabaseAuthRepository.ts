import { AuthRepositoryInterface } from "../../domain/interfaces/AuthRepository.interface";
import { SupabaseService } from "../../../shared/infrastructure/supabase/SupabaseClient";
import { LoginRequestDTO } from "../../application/DTOs/LoginRequestDTO";

export class SupabaseAuthRepository implements AuthRepositoryInterface {
  private readonly client = new SupabaseService().getClient();

  constructor() {
    this.client = new SupabaseService().getClient();
  }

  async login(credentials: LoginRequestDTO) {
    const { email, password } = credentials;

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`Login failed: ${error.message}`);

    const session = data.session;
    if (!session) throw new Error("No session returned by Supabase");

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: session.user.id,
        email: session.user.email!,
      },
    };
  }
}
