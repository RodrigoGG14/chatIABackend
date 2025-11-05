import { MessageAttachmentInterface } from "@/messageAttachments/domain/interfaces/MessageAttachment.interface";

export interface FindMessagesByConversationIdResponseDTO {
  id: string;
  conversation_id: string;
  content: string | null;
  sender: "user" | "ai" | "admin";
  sent_at: string;
  attachments: MessageAttachmentInterface[];
}
