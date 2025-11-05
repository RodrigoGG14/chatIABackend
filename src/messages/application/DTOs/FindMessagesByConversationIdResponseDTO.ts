export interface FindMessagesByConversationIdResponseDTO {
  id: string;
  conversation_id: string;
  content: string | null;
  sender: string;
  sent_at: string;
  attachments: {
    id: string;
    file_path: string;
    mime_type: string;
    category: string;
    file_name: string;
    created_at: string;
  }[];
}
