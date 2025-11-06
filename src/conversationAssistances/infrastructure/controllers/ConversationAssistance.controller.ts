import { FindConversationAssistanceByConversationIdUseCase } from "@/conversationAssistances/application/FindByConversationId.application";

import { ConversationAssistanceRepository } from "@/conversationAssistances/infrastructure/repositories/ConversationAssistance.repository";

import { ResolveConversationAssistanceUseCase } from "@/conversationAssistances/application/ResolveConversationAssistance.application";
import { InsertConversationAssistanceUseCase } from "@/conversationAssistances/application/InsertConversationAssistance.application";
import { AuthenticatedRequestInterface } from "@/shared/domain/interfaces/AuthenticatedRequestInterface";

import { Request, Response } from "express";

export class ConversationAssistanceController {
  private readonly insertConversationAssistanceUseCase: InsertConversationAssistanceUseCase;
  private readonly findConversationAssistanceByConversationIdUseCase: FindConversationAssistanceByConversationIdUseCase;
  private readonly resolveConversationAssistanceUseCase: ResolveConversationAssistanceUseCase;

  constructor() {
    const repository = new ConversationAssistanceRepository();
    this.insertConversationAssistanceUseCase =
      new InsertConversationAssistanceUseCase(repository);
    this.findConversationAssistanceByConversationIdUseCase =
      new FindConversationAssistanceByConversationIdUseCase(repository);
    this.resolveConversationAssistanceUseCase =
      new ResolveConversationAssistanceUseCase(repository);
  }

  async insertConversationAssistance(
    req: AuthenticatedRequestInterface,
    res: Response
  ): Promise<void> {
    try {
      const { conversationId, needsHuman, reason } = req.body;
      if (req.auth?.type !== "internal") {
        res.status(403).json({
          success: false,
          message: "Forbidden: only internal backend can create assistances",
        });
        return;
      }

      if (
        !conversationId ||
        typeof needsHuman !== "boolean" ||
        !("reason" in req.body)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid or missing fields",
          error: {
            code: "MISSING_CONVERSATION_ID",
            message:
              "ConversationId must be a string, needsHuman a Boolean value, and reason a string or null.",
          },
        });
        return;
      }

      const obj = {
        conversation_id: conversationId,
        needs_human: needsHuman,
        reason: reason,
      };

      const result = await this.insertConversationAssistanceUseCase.execute(
        obj
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "SERVER_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      });
    }
  }

  async getConversationAssistanceByConversationId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "Missing conversationId parameter",
          error: {
            code: "MISSING_CONVERSATION_ID",
            message: "conversationId parameter is required",
          },
        });
        return;
      }

      const result =
        await this.findConversationAssistanceByConversationIdUseCase.execute(
          conversationId
        );

      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  async resolveConversationAssistance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Missing assistance id",
        });
      }

      const result = await this.resolveConversationAssistanceUseCase.execute(
        id
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: {
          code: "SERVER_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      });
    }
  }
}
