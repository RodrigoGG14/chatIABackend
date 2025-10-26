import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";
import { UserInterface } from "@/users/domain/interfaces/User.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(): Promise<ApiResponse<UserInterface[]>> {
    const users = await this.userRepository.getUsers();

    if (users.length === 0) {
      return {
        success: false,
        message: "No users found",
        data: [],
      };
    }

    return {
      success: true,
      message: "Users fetched successfully",
      data: users,
    };
  }
}
