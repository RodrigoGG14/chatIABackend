import { ConversationInsertInterface } from "@/conversations/domain/interfaces/ConversationInsert.interfaces";
import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";

export interface ConversationRepositoryInterface {
  findByUserId(user_id: string): Promise<ConversationInterface | null>;
  insertConversation(conversation: ConversationInsertInterface): Promise<ConversationInterface>;
}
