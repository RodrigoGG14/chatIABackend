import { ApiResponse } from "../../shared/application/ApiResponse";
import { MessageRepositoryInterface } from "../domain/interfaces/MessageRepository.interface";
import { FindMessagesByConversationIdResponseDTO } from "./DTOs/FindMessagesByConversationIdResponseDTO";



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
