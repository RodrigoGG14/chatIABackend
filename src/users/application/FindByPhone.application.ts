import { UserRepositoryInterface } from "../../users/domain/interfaces/UserRepository.interface";
import { UserInterface } from "../../users/domain/interfaces/User.interface";
import { ApiResponse } from "../../shared/application/ApiResponse";

export class FindUserByPhoneUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(phone: string): Promise<ApiResponse<UserInterface>> {
    const user = await this.userRepository.findByPhone(phone);

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
