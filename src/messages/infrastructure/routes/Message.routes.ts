import { MessageController } from "../../../messages/infrastructure/controllers/Message.controller";
import { Router } from "express";

const MessageRoutes: Router = Router();
const controller = new MessageController();

MessageRoutes.get(
  "/messages/:conversationId",
  controller.getMessagesByConversationId.bind(controller)
);

export default MessageRoutes;
