import { FindMessagesByConversationIdResponseDTO } from "../../../messages/application/DTOs/FindMessagesByConversationIdResponseDTO";
import { MessageInterface } from "./Message.interface";
import { MessageInsertInterface } from "./MessageInsert.interface";

export interface MessageRepositoryInterface {
  insertMessage(message: MessageInsertInterface): Promise<MessageInterface>;
  findMessagesByConversationId(
    conversationId: string
  ): Promise<FindMessagesByConversationIdResponseDTO[]>;
  deleteById(messageId: string): Promise<void>;
}
