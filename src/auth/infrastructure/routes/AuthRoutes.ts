import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { AuthController } from "../../infrastructure/controllers/AuthController";
import { LoginUseCase } from "../../application/LoginUseCase";
import { Router } from "express";

const Authrouter: Router = Router();

const authRepository = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepository);
const authController = new AuthController(loginUseCase);

Authrouter.post("/login", (req, res) => authController.login(req, res));

export default Authrouter;
