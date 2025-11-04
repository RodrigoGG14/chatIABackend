import { MessageRepositoryInterface } from "@/messages/domain/interfaces/MessageRepository.interface";
import { MessageInsertInterface } from "@/messages/domain/interfaces/MessageInsert.interface";
import { MessageInterface } from "@/messages/domain/interfaces/Message.interface";

import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class MessageRepository implements MessageRepositoryInterface {
  private readonly client = new SupabaseService().getClient();

  constructor() {
    this.client = new SupabaseService().getClient();
  }

  async insertMessage(
    message: MessageInsertInterface
  ): Promise<MessageInterface> {
    const { data, error } = await this.client
      .from("messages")
      .insert(message)
      .select()
      .single();

    if (error) {
      throw new Error(`Error inserting message: ${error.message}`);
    }

    if (!data) {
      throw new Error("Insert succeeded but no message was returned");
    }

    return data;
  }

  async findMessagesByConversationId(
    conversationId: string
  ): Promise<MessageInterface[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true }); // mensajes del más viejo al más nuevo

    if (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }

    return data ?? [];
  }

  async deleteById(messageId: string): Promise<void> {
    const { error } = await this.client
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw new Error(`Error deleting message: ${error.message}`);
  }
}
