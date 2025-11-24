import { ConversationAssistancesRepositoryInterface } from "@/conversationAssistances/domain/interfaces/ConversationAssistanceRepository.interface";
import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class UpdateHumanOverrideStatusUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepositoryInterface,
    private readonly assistanceRepository: ConversationAssistancesRepositoryInterface
  ) {}

  async execute(
    value: boolean,
    conversationId: string
  ): Promise<ApiResponse<void>> {
    try {
      // Primero, actualizamos el estado de human_override en la conversación.
      await this.conversationRepository.updateHumanOverrideStatus(
        value,
        conversationId
      );

      // Si se está activando la intervención humana, buscamos y resolvemos la asistencia pendiente.
      if (value === true) {
        const assistance =
          await this.assistanceRepository.findAssistanceByConversationId(
            conversationId
          );

        if (assistance) {
          await this.assistanceRepository.resolveAssistance(assistance.id);
        }
      }

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
