import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class FindConversationByUserIdUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {}

  async execute(user_id: string): Promise<ApiResponse<ConversationInterface>> {
    const conversation = await this.conversationRepository.findByUserId(
      user_id
    );

    if (conversation) {
      return {
        success: true,
        message: "Conversation fetched successfully",
        data: conversation,
      };
    }

    return {
      success: false,
      message: "No conversation found",
      data: null,
    };
  }
}
