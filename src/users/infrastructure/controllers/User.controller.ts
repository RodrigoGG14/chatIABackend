import { UserRepository } from "../../../users/infrastructure/repositories/User.repository";
import { UserInterface } from "../../../users/domain/interfaces/User.interface";

import { FindUserByUserIdUseCase } from "../../../users/application/FindByUserId.application";
import { GetUsersUseCase } from "../../../users/application/GetUsers.application";
import { ApiResponse } from "../../../shared/application/ApiResponse";

import { Request, Response } from "express";

export class UserController {
  private readonly getUsersUseCase: GetUsersUseCase;
  private readonly findUserByUserIdUseCase: FindUserByUserIdUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
    this.findUserByUserIdUseCase = new FindUserByUserIdUseCase(userRepository);
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const useCaseResult: ApiResponse<UserInterface[]> =
        await this.getUsersUseCase.execute();

      if (!useCaseResult.success) {
        if (useCaseResult.data?.length === 0) {
          res.status(404).json(useCaseResult);
          return;
        }

        res.status(400).json({
          success: false,
          message: useCaseResult.message,
          error: useCaseResult.error ?? {
            code: "BAD_REQUEST",
            message: "Invalid request",
          },
        });
        return;
      }

      res.status(200).json(useCaseResult);
      return;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown server error";

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "SERVER_ERROR",
          message,
        },
      });
      return;
    }
  }

  async getUserByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required",
          error: {
            code: "MISSING_PARAM",
            message: "Missing 'userId' parameter in request",
          },
        });
        return;
      }

      const result = await this.findUserByUserIdUseCase.execute(userId);

      if (!result.success || !result.data) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: {
            code: "USER_NOT_FOUND",
            message: `No user found with ID ${userId}`,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "INTERNAL_ERROR",
          message: (error as Error).message || "Unexpected error occurred",
        },
      });
    }
  }
}
