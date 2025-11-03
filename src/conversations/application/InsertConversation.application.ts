import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ConversationInsertInterface } from "@/conversations/domain/interfaces/ConversationInsert.interfaces";
import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class InsertConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {}

  async execute(
    conversationRequest: ConversationInsertInterface
  ): Promise<ApiResponse<ConversationInterface>> {
    try {
      const conversation = await this.conversationRepository.insertConversation(
        conversationRequest
      );
      return {
        success: true,
        message: "Conversation created successfully",
        data: conversation,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error creating user";
      return {
        success: false,
        message: "Failed to create conversation",
        error: {
          code: "CONVERSATION_CREATION_FAILED",
          message,
        },
      };
    }
  }
}
