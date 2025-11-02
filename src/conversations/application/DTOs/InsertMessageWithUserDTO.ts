export type SenderType = "user" | "ai";

export interface InsertMessageWithUserDTOBase {
  content: string;
  senderType: SenderType;
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
