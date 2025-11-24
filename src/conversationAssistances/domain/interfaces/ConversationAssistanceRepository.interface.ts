import { ConversationAssistances } from "./ConversationAssistance.interface";
import { InsertConversationAssistances } from "./InsertConversationAssistance.interface";

export interface ConversationAssistancesRepositoryInterface {
  insertAssistancesForConversation(
    conversationId: InsertConversationAssistances
  ): Promise<ConversationAssistances>;
  findAssistanceByConversationId(
    conversationId: string
  ): Promise<ConversationAssistances | null>;
  resolveAssistance(id: string): Promise<boolean>;
}
