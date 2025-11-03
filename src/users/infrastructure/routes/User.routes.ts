import { UserController } from "@/users/infrastructure/controllers/User.controller";
import { Router } from "express";

const UserRoutes: Router = Router();
const controller = new UserController();

UserRoutes.get("/users", (req, res) => controller.getUsers(req, res));
UserRoutes.get("/users/:userId", controller.getUserByUserId.bind(controller));

export default UserRoutes;
