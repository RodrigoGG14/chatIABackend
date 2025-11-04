import { MessageAttachmentRepositoryInterface } from "@/messageAttachments/domain/interfaces/MessageAttachmentRepository.interface";
import { MessageAttachmentInsertInterface } from "@/messageAttachments/domain/interfaces/MessageAttachmentInsert.interface";
import { MessageAttachmentInterface } from "@/messageAttachments/domain/interfaces/MessageAttachment.interface";
import { SupabaseService } from "@/shared/infrastructure/supabase/SupabaseClient";

export class MessageAttachmentRepository
  implements MessageAttachmentRepositoryInterface
{
  private readonly client = new SupabaseService().getClient();

  async insertAttachment(
    attachment: MessageAttachmentInsertInterface
  ): Promise<MessageAttachmentInterface> {
    const { data, error } = await this.client
      .from("message_attachments")
      .insert([attachment])
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(`Error inserting attachment: ${error.message}`);
    }

    if (!data) {
      throw new Error("Attachment insertion returned no data.");
    }

    return data;
  }

  async findByMessageId(
    messageId: string
  ): Promise<MessageAttachmentInterface[]> {
    const { data, error } = await this.client
      .from("message_attachments")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Error fetching attachments: ${error.message}`);
    }

    return data ?? [];
  }
}
