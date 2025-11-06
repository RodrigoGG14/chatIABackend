import { InsertConversationAssistances } from "@/conversationAssistances/domain/interfaces/InsertConversationAssistance.interface";
import { ConversationAssistances } from "@/conversationAssistances/domain/interfaces/ConversationAssistance.interface";

export interface ConversationAssistancesRepositoryInterface {
  insertAssistancesForConversation(
    conversationId: InsertConversationAssistances
  ): Promise<ConversationAssistances>;
  findAssistanceByConversationId(
    conversationId: string
  ): Promise<ConversationAssistances | null>;
}
