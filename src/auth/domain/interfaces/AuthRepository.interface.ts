import { LoginRequestDTO } from "../../application/DTOs/LoginRequestDTO";


export interface AuthRepositoryInterface {
  login(credentials: LoginRequestDTO): Promise<{
    access_token: string;
    refresh_token: string;
    user: { id: string; email: string };
  }>;
}
