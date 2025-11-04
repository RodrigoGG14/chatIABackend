import { MessageAttachmentInterface } from "./MessageAttachment.interface";
import { MessageAttachmentInsertInterface } from "./MessageAttachmentInsert.interface";

export interface MessageAttachmentRepositoryInterface {
  insertAttachment(
    attachment: MessageAttachmentInsertInterface
  ): Promise<MessageAttachmentInterface>;

  findByMessageId(messageId: string): Promise<MessageAttachmentInterface[]>;
}
