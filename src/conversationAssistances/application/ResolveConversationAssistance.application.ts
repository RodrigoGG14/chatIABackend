import { ApiResponse } from "../../shared/application/ApiResponse";
import { ConversationAssistancesRepositoryInterface } from "../domain/interfaces/ConversationAssistanceRepository.interface";

export class ResolveConversationAssistanceUseCase {
  constructor(
    private readonly conversationAssistanceRepository: ConversationAssistancesRepositoryInterface
  ) {}

  async execute(id: string): Promise<ApiResponse<null>> {
    try {
      const updated =
        await this.conversationAssistanceRepository.resolveAssistance(id);

      if (!updated) {
        return {
          success: false,
          message: "Assistance not found or could not be updated",
          error: {
            code: "ASSISTANCE_RESOLVE_FAILED",
            message: "The assistance could not be resolved",
          },
        };
      }

      return {
        success: true,
        message: "Assistance resolved successfully",
        data: null,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error resolving assistance";

      return {
        success: false,
        message: "Failed to resolve conversation assistance",
        error: {
          code: "ASSISTANCE_RESOLVE_ERROR",
          message,
        },
      };
    }
  }
}
