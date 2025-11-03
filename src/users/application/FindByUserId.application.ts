import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";
import { UserInterface } from "@/users/domain/interfaces/User.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class FindUserByUserIdUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(userId: string): Promise<ApiResponse<UserInterface>> {
    const user = await this.userRepository.findByUserId(userId);

    if (user) {
      return {
        success: true,
        message: "User fetched successfully",
        data: user,
      };
    }

    return {
      success: false,
      message: "No user found",
      data: null,
    };
  }
}
