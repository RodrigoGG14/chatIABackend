import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class UpdateHumanOverrideStatusUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {}

  async execute(
    value: boolean,
    conversationId: string
  ): Promise<ApiResponse<void>> {
    try {
      await this.conversationRepository.updateHumanOverrideStatus(
        value,
        conversationId
      );

      return {
        success: true,
        message: `Human override ${
          value ? "enabled" : "disabled"
        } successfully`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";

      return {
        success: false,
        message: "Failed to update human override status",
        error: {
          code: "HUMAN_OVERRIDE_UPDATE_FAILED",
          message,
        },
      };
    }
  }
}
