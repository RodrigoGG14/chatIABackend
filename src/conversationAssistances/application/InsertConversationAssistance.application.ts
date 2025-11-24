import { ApiResponse } from "../../shared/application/ApiResponse";
import { ConversationAssistancesRepositoryInterface } from "../domain/interfaces/ConversationAssistanceRepository.interface";
import { InsertConversationAssistances } from "../domain/interfaces/InsertConversationAssistance.interface";

export class InsertConversationAssistanceUseCase {
  constructor(
    private readonly conversationAssistanceRepository: ConversationAssistancesRepositoryInterface
  ) {}

  async execute(
    conversationAssistanceRequest: InsertConversationAssistances
  ): Promise<ApiResponse<InsertConversationAssistances>> {
    try {
      const conversationAssistance =
        await this.conversationAssistanceRepository.insertAssistancesForConversation(
          conversationAssistanceRequest
        );

      return {
        success: true,
        message: "Conversation assistance created successfully",
        data: conversationAssistance,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error creating conversation assistance";
      return {
        success: false,
        message: "Failed to create conversation assistance",
        error: {
          code: "CONVERSATION_ASSISTANCE_CREATION_FAILED",
          message,
        },
      };
    }
  }
}
