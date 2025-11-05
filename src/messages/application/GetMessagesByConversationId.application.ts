import { FindMessagesByConversationIdResponseDTO } from "@/messages/application/DTOs/FindMessagesByConversationIdResponseDTO";
import { MessageRepositoryInterface } from "@/messages/domain/interfaces/MessageRepository.interface";
import { ApiResponse } from "@/shared/application/ApiResponse";

export class GetMessagesByConversationIdUseCase {
  constructor(private readonly messageRepository: MessageRepositoryInterface) {}

  async execute(
    conversationId: string
  ): Promise<ApiResponse<FindMessagesByConversationIdResponseDTO[]>> {
    const messages = await this.messageRepository.findMessagesByConversationId(
      conversationId
    );

    if (messages.length === 0) {
      return {
        success: false,
        message: "No users found",
        data: [],
      };
    }

    return {
      success: true,
      message: "Users fetched successfully",
      data: messages,
    };
  }
}
