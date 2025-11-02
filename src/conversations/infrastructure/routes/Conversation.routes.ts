import { ConversationController } from "@/conversations/infrastructure/controllers/Conversation.controller";
import { Router } from "express";

const UserRoutes: Router = Router();
const controller = new ConversationController();

UserRoutes.post("/messages", (req, res) => controller.insertMessage(req, res));

export default UserRoutes;
