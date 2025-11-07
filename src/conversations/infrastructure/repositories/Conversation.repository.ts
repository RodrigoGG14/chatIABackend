import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { InsertMessageCascadeResult } from "@/conversations/domain/interfaces/InsertMessageCascadeResult.interface";
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

  async getConversations(filters?: {
    from?: Date;
    to?: Date;
    humanOverride?: boolean;
    minMessages?: number;
    text?: string;
  }): Promise<ConversationInterface[]> {
    const { from, to, humanOverride, minMessages, text } = filters ?? {};

    const rpcParams: {
      p_from?: string;
      p_to?: string;
      p_human_override?: boolean;
      p_min_messages?: number;
      p_text?: string;
    } = {};

    if (from) rpcParams.p_from = from.toISOString();
    if (to) rpcParams.p_to = to.toISOString();
    if (humanOverride !== undefined) rpcParams.p_human_override = humanOverride;
    if (minMessages !== undefined) rpcParams.p_min_messages = minMessages;
    if (text) rpcParams.p_text = text;

    const { data, error } = await this.client.rpc(
      "get_filtered_conversations",
      rpcParams
    );

    if (error) {
      throw new Error(
        `Error fetching filtered conversations: ${error.message}`
      );
    }

    if (!data) {
      return [];
    }

    const conversations: ConversationInterface[] = data.map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      user_id: String(row.user_id),
      human_override: Boolean(row.human_override),
      start_date: String(row.start_date),
      latest_date: String(row.latest_date),
    }));

    return conversations;
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

  async updateTitle(title: string, conversationId: string): Promise<void> {
    const { error } = await this.client
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);

    if (error) {
      throw new Error(
        `Error updating title for conversation ${conversationId}: ${error.message}`
      );
    }
  }

  async insertMessageCascade(params: {
    phone: string;
    name?: string;
    content: string;
    sender: "user";
  }): Promise<InsertMessageCascadeResult> {
    const { data, error } = await this.client
      .rpc("insert_message_cascade", {
        p_phone: params.phone,
        p_name: params.name ?? "",
        p_content: params.content,
        p_sender: params.sender,
      })
      .single();

    if (error)
      throw new Error(`Error in insert_message_cascade: ${error.message}`);
    if (!data) throw new Error("insert_message_cascade returned no data");

    // data ya debe contener { message_id, conversation_id, user_id }
    return data as InsertMessageCascadeResult;
  }
}
