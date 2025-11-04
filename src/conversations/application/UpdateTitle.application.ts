import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class UpdateTitleUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {}

  async execute(
    title: string,
    conversationId: string
  ): Promise<ApiResponse<void>> {
    try {
      await this.conversationRepository.updateTitle(title, conversationId);

      return {
        success: true,
        message: "Title updated successfully",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";

      return {
        success: false,
        message: "Failed to update title",
        error: {
          code: "TITLE_UPDATE_FAILED",
          message,
        },
      };
    }
  }
}
