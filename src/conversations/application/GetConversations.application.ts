import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { GetConversationsResponseDTO } from "@/conversations/application/DTOs/GetConversationsResponseDTO";
import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface,
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(): Promise<ApiResponse<GetConversationsResponseDTO[]>> {
    try {
      const conversations =
        await this.conversationRepository.getConversations();

      if (conversations.length === 0) {
        return {
          success: false,
          message: "No conversations found",
          data: [],
        };
      }

      const userIds = Array.from(new Set(conversations.map((c) => c.user_id)));
      const users = await this.userRepository.findUsersByIds(userIds);
      const userPhoneMap = new Map(users.map((u) => [u.id, u.phone]));

      const conversationsWithPhone: GetConversationsResponseDTO[] = [];

      for (const convo of conversations) {
        const phone = userPhoneMap.get(convo.user_id);

        if (!phone) {
          return {
            success: false,
            message: `User phone not found for user_id: ${convo.user_id}`,
            data: null,
            error: {
              code: "DATA_INTEGRITY_ERROR",
              message: `User phone not found for user_id: ${convo.user_id}`,
            },
          };
        }

        conversationsWithPhone.push({
          ...convo,
          phone,
        });
      }

      return {
        success: true,
        message: "Conversations fetched successfully",
        data: conversationsWithPhone,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Internal server error retrieving conversations";

      return {
        success: false,
        message: "Internal server error",
        data: null,
        error: {
          code: "SERVER_ERROR",
          message,
        },
      };
    }
  }
}
