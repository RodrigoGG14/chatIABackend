import { ApiResponse } from "../../shared/application/ApiResponse";
import { ConversationInterface } from "../domain/interfaces/Conversation.interface";
import { ConversationRepositoryInterface } from "../domain/interfaces/ConversationRepository.interface";



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
