import { Request, Response } from "express";
import * as cookie from "cookie";
import { LoginUseCase } from "../../application/LoginUseCase";

export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await this.loginUseCase.execute({ email, password });

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      // Guardamos los tokens en cookies HTTP-only
      const authRepo = (this.loginUseCase as any).authRepository;
      const session = await authRepo.login({ email, password });

      res.setHeader("Set-Cookie", [
        cookie.serialize("sb-access-token", session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60,
        }),
        cookie.serialize("sb-refresh-token", session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        }),
      ]);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error during login",
      });
    }
  }
}
