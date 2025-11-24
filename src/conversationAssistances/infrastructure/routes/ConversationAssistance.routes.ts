// import { VerifyAuthMiddleware } from "@/shared/infrastructure/middlewares/verifyAuthMiddleware";
import { Router } from "express";
import { ConversationAssistanceController } from "../controllers/ConversationAssistance.controller";

const ConversationAssistanceRoutes: Router = Router();
const controller = new ConversationAssistanceController();
// const verifyAuth = new VerifyAuthMiddleware();

// ConversationAssistanceRoutes.post(
//   "/assistances",
//   (req, res, next) => verifyAuth.handle(req, res, next),
//   (req, res) => controller.insertConversationAssistance(req, res)
// );

ConversationAssistanceRoutes.post("/assistances", (req, res) =>
  controller.insertConversationAssistance(req, res)
);

// TODO: agregar middleware de autenticación
ConversationAssistanceRoutes.get("/assistances/:conversationId", (req, res) =>
  controller.getConversationAssistanceByConversationId(req, res)
);

ConversationAssistanceRoutes.patch("/assistances/:id/resolve", (req, res) =>
  controller.resolveConversationAssistance(req, res)
);

export default ConversationAssistanceRoutes;
