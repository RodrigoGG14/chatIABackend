import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { ConversationInsertInterface } from "@/conversations/domain/interfaces/ConversationInsert.interfaces";
import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";
import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class ConversationRepository implements ConversationRepositoryInterface {
  private readonly client = new SupabaseService().getClient();

  constructor() {
    this.client = new SupabaseService().getClient();
  }

  async findByUserId(user_id: string): Promise<ConversationInterface | null> {
    const { data, error } = await this.client
      .from("conversations")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data;
  }

  async insertConversation(
    conversation: ConversationInsertInterface
  ): Promise<ConversationInterface> {
    const { data, error } = await this.client
      .from("conversations")
      .insert(conversation)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getConversations(): Promise<ConversationInterface[]> {
    const { data, error } = await this.client.from("conversations").select("*");
    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    return data ?? [];
  }

  async findByPhone(phone: string): Promise<ConversationInterface | null> {
    const { data, error } = await this.client
      .from("conversations")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }

    return data;
  }

  async updateHumanOverrideStatus(
    value: boolean,
    conversationId: string
  ): Promise<void> {
    const { error } = await this.client
      .from("conversations")
      .update({ human_override: value })
      .eq("id", conversationId);

    if (error) {
      throw new Error(
        `Error updating human_override for conversation ${conversationId}: ${error.message}`
      );
    }
  }
}
