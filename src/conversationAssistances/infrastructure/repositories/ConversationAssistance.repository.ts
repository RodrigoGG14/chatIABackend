import { ConversationAssistancesRepositoryInterface } from "@/conversationAssistances/domain/interfaces/ConversationAssistanceRepository.interface";
import { InsertConversationAssistances } from "@/conversationAssistances/domain/interfaces/InsertConversationAssistance.interface";
import { ConversationAssistances } from "@/conversationAssistances/domain/interfaces/ConversationAssistance.interface";
import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class ConversationAssistanceRepository
  implements ConversationAssistancesRepositoryInterface
{
  private readonly client = new SupabaseService().getClient();

  constructor() {
    this.client = new SupabaseService().getClient();
  }

  async insertAssistancesForConversation(
    conversationAssistance: InsertConversationAssistances
  ): Promise<ConversationAssistances> {
    const { data, error } = await this.client
      .from("conversation_assistances")
      .insert(conversationAssistance)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Error inserting conversation assistance: ${error.message}`
      );
    }

    return data;
  }

  async findAssistanceByConversationId(
    conversationId: string
  ): Promise<ConversationAssistances | null> {
    const { data, error } = await this.client
      .from("conversation_assistances")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Error finding latest conversation assistance: ${error.message}`
      );
    }

    return data;
  }
}
