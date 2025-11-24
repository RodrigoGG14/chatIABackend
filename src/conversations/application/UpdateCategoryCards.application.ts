import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ConversaionCategory } from "@/conversations/domain/interfaces/Conversation.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class UpdateCategoryCardsUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {}

  async execute(
    conversationId: string,
    category: ConversaionCategory | null,
    alerts: boolean
  ): Promise<ApiResponse<null>> {
    try {
      await this.conversationRepository.updateCategoryAndAlerts(
        conversationId,
        category,
        alerts
      );

      return {
        success: true,
        message: "Conversation category updated successfully",
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update conversation category",
        error: {
          code: "UPDATE_CATEGORY_ERROR",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
