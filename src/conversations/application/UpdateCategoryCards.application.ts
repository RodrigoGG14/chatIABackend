import { ApiResponse } from "../../shared/application/ApiResponse";
import { ConversaionCategory } from "../domain/interfaces/Conversation.interface";
import { ConversationRepositoryInterface } from "../domain/interfaces/ConversationRepository.interface";

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
