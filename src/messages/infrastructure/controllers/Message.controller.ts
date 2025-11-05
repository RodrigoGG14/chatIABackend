import { FindMessagesByConversationIdResponseDTO } from "@/messages/application/DTOs/FindMessagesByConversationIdResponseDTO";
import { GetMessagesByConversationIdUseCase } from "@/messages/application/GetMessagesByConversationId.application";
import { MessageRepository } from "@/messages/infrastructure/repositories/Message.repository";
import { ApiResponse } from "@/shared/application/ApiResponse";

import { Request, Response } from "express";

export class MessageController {
  private readonly getMessagesByConversationIdUseCase: GetMessagesByConversationIdUseCase;

  constructor() {
    const messageRepository = new MessageRepository();
    this.getMessagesByConversationIdUseCase =
      new GetMessagesByConversationIdUseCase(messageRepository);
  }

  async getMessagesByConversationId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "conversationId is required",
          error: {
            code: "MISSING_PARAM",
            message: "conversationId param missing",
          },
        });
        return;
      }

      const useCaseResult: ApiResponse<
        FindMessagesByConversationIdResponseDTO[]
      > = await this.getMessagesByConversationIdUseCase.execute(conversationId);

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
}
