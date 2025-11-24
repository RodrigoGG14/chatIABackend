import { ConversationController } from "@/conversations/infrastructure/controllers/Conversation.controller";
// import { VerifyAuthMiddleware } from "@/shared/infrastructure/middlewares/verifyAuthMiddleware";
import { upload } from "@/shared/infrastructure/multerConfig";
import { Router } from "express";

const ConversationRoutes: Router = Router();
const controller = new ConversationController();
// const verifyAuth = new VerifyAuthMiddleware();

// TODO: Agregar los middlewares de autenticación donde sean necesarios

// ConversationRoutes.post(
//   "/messages",
//   (req, res, next) => verifyAuth.handle(req, res, next),
//   upload.single("file"),
//   (req, res) => controller.insertMessage(req, res)
// );

ConversationRoutes.post("/messages", upload.single("file"), (req, res) =>
  controller.insertMessage(req, res)
);

ConversationRoutes.get("/conversations", (req, res) =>
  controller.getConversations(req, res)
);

// ConversationRoutes.get(
//   "/conversations/:phone",
//   (req, res, next) => verifyAuth.handle(req, res, next),
//   controller.getConversationByPhone.bind(controller)
// );

ConversationRoutes.get(
  "/conversations/:phone",
  controller.getConversationByPhone.bind(controller)
);

ConversationRoutes.patch(
  "/conversations/:conversationId/human-override",
  controller.updateHumanOverrideStatus.bind(controller)
);

ConversationRoutes.put(
  "/conversations/:conversationId",
  controller.updateTitle.bind(controller)
);

ConversationRoutes.patch(
  "/conversations/:conversationId/category",
  controller.updateCategoryCards.bind(controller)
);

export default ConversationRoutes;
