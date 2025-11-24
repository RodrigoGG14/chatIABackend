
import { ApiResponse } from "../../shared/application/ApiResponse";
import { AuthRepositoryInterface } from "../domain/interfaces/AuthRepository.interface";
import { LoginRequestDTO } from "./DTOs/LoginRequestDTO";

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepositoryInterface) {}

  async execute(credentials: LoginRequestDTO): Promise<
    ApiResponse<{
      id: string;
      email: string;
    }>
  > {
    try {
      const result = await this.authRepository.login(credentials);

      return {
        success: true,
        message: "Login successful",
        data: result.user,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error during login";
      return {
        success: false,
        message,
      };
    }
  }
}
