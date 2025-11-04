export type SenderType = "user" | "ai";

export interface MediaAttachmentDTO {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  category: "image" | "audio" | "video" | "file"; 
}

export interface InsertMessageWithUserDTOBase {
  content: string;
  senderType: SenderType;
  media?: MediaAttachmentDTO; 
}

export interface InsertUserMessageDTO extends InsertMessageWithUserDTOBase {
  senderType: "user";
  phone: string;
  name?: string;
}

export interface InsertAIMessageDTO extends InsertMessageWithUserDTOBase {
  senderType: "ai";
  phone: string;
}

export type InsertMessageWithUserDTO =
  | InsertUserMessageDTO
  | InsertAIMessageDTO;
