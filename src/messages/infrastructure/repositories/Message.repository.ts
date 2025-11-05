import { FindMessagesByConversationIdResponseDTO } from "@/messages/application/DTOs/FindMessagesByConversationIdResponseDTO";
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
  ): Promise<FindMessagesByConversationIdResponseDTO[]> {
    const { data, error } = await this.client
      .from("messages")
      .select(
        `
      id,
      conversation_id,
      content,
      sender,
      sent_at,
      message_attachments (
        id,
        file_path,
        mime_type,
        category,
        file_name,
        created_at
      )
    `
      )
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true });

    if (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }

    const messages: FindMessagesByConversationIdResponseDTO[] = data.map(
      (msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        content: msg.content,
        sender: msg.sender, 
        sent_at: msg.sent_at,
        attachments: msg.message_attachments ?? [],
      })
    );

    return messages;
  }

  async deleteById(messageId: string): Promise<void> {
    const { error } = await this.client
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw new Error(`Error deleting message: ${error.message}`);
  }
}
