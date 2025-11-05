import { FindMessagesByConversationIdResponseDTO } from "@/messages/application/DTOs/FindMessagesByConversationIdResponseDTO";
import { MessageInsertInterface } from "@/messages/domain/interfaces/MessageInsert.interface";
import { MessageInterface } from "@/messages/domain/interfaces/Message.interface";

export interface MessageRepositoryInterface {
  insertMessage(message: MessageInsertInterface): Promise<MessageInterface>;
  findMessagesByConversationId(
    conversationId: string
  ): Promise<FindMessagesByConversationIdResponseDTO[]>;
  deleteById(messageId: string): Promise<void>;
}
