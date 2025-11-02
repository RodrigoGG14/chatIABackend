export interface InsertMessageWithUserResponseDTO {
  messageId: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    phone?: string;
    name: string;
  };
  createdUser: boolean;
}
