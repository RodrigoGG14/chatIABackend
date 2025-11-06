import { ConversationAssistancesRepositoryInterface } from "@/conversationAssistances/domain/interfaces/ConversationAssistanceRepository.interface";
import { ConversationAssistances } from "@/conversationAssistances/domain/interfaces/ConversationAssistance.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class FindConversationAssistanceByConversationIdUseCase {
  constructor(
    private readonly conversationAssistanceRepository: ConversationAssistancesRepositoryInterface
  ) {}

  async execute(
    conversationId: string
  ): Promise<ApiResponse<ConversationAssistances | null>> {
    try {
      const conversationAssistance =
        await this.conversationAssistanceRepository.findAssistanceByConversationId(
          conversationId
        );

      if (conversationAssistance) {
        return {
          success: true,
          message: "Conversation assistance fetched successfully",
          data: conversationAssistance,
        };
      } else {
        return {
          success: false,
          message: "No conversation assistance found",
          data: null,
        };
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error fetching conversation assistance";
      return {
        success: false,
        message: "Failed to fetch conversation assistance",
        error: {
          code: "CONVERSATION_ASSISTANCE_FETCH_FAILED",
          message,
        },
      };
    }
  }
}
