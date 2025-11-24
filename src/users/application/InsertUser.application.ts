import { UserRepositoryInterface } from "../../users/domain/interfaces/UserRepository.interface";
import { UserInsertInterface } from "../../users/domain/interfaces/UserInsert.interface";
import { UserInterface } from "../../users/domain/interfaces/User.interface";

import { ApiResponse } from "../../shared/application/ApiResponse";

export class InsertUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(
    userRequest: UserInsertInterface
  ): Promise<ApiResponse<UserInterface>> {
    try {
      const user = await this.userRepository.insertUser(userRequest);
      return {
        success: true,
        message: "User created successfully",
        data: user,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error creating user";
      return {
        success: false,
        message: "Failed to create user",
        error: {
          code: "USER_CREATION_FAILED",
          message,
        },
      };
    }
  }
}
