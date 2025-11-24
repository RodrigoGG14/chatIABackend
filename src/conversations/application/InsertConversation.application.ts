import { ApiResponse } from "../../shared/application/ApiResponse";
import { ConversationInterface } from "../domain/interfaces/Conversation.interface";
import { ConversationInsertInterface } from "../domain/interfaces/ConversationInsert.interfaces";
import { ConversationRepositoryInterface } from "../domain/interfaces/ConversationRepository.interface";



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
