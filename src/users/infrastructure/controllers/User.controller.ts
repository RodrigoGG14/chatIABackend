import { UserRepository } from "@/users/infrastructure/repositories/User.repository";
import { UserInterface } from "@/users/domain/interfaces/User.interface";

import { GetUsersUseCase } from "@/users/application/GetUsers.application";
import { ApiResponse } from "@/shared/application/ApiResponse";

import { Request, Response } from "express";

export class UserController {
  private readonly getUsersUseCase: GetUsersUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
  }

  async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const useCaseResult: ApiResponse<UserInterface[]> =
        await this.getUsersUseCase.execute();

      if (!useCaseResult.success) {
        if (useCaseResult.data?.length === 0) {
          return res.status(404).json(useCaseResult);
        }

        return res.status(400).json({
          success: false,
          message: useCaseResult.message,
          error: useCaseResult.error ?? {
            code: "BAD_REQUEST",
            message: "Invalid request",
          },
        });
      }

      return res.status(200).json(useCaseResult);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown server error";

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "SERVER_ERROR",
          message,
        },
      });
    }
  }
}
