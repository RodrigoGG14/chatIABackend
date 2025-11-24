import { ConversationInsertInterface } from "@/conversations/domain/interfaces/ConversationInsert.interfaces";
import {
  ConversaionCategory,
  ConversationInterface,
} from "@/conversations/domain/interfaces/Conversation.interface";
import { InsertMessageCascadeResult } from "./InsertMessageCascadeResult.interface";

export interface ConversationRepositoryInterface {
  findByUserId(user_id: string): Promise<ConversationInterface | null>;
  insertConversation(
    conversation: ConversationInsertInterface
  ): Promise<ConversationInterface>;
  getConversations(filters?: {
    from?: Date;
    to?: Date;
    humanOverride?: boolean;
    minMessages?: number;
  }): Promise<ConversationInterface[]>;
  findByPhone(phone: string): Promise<ConversationInterface | null>;
  updateHumanOverrideStatus(
    value: boolean,
    conversationId: string
  ): Promise<void>;
  updateTitle(title: string, conversationId: string): Promise<void>;
  insertMessageCascade(params: {
    phone: string;
    name?: string;
    content: string;
    sender: "user";
  }): Promise<InsertMessageCascadeResult>;
  updateCategoryAndAlerts(
    conversationId: string,
    category: ConversaionCategory | null,
    alerts: boolean
  ): Promise<void>;
}
