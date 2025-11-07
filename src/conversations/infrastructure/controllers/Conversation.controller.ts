import { EnsureUserAndInsertMessageUseCase } from "@/conversations/application/EnsureUserAndInsertMessage.application";
import { UpdateHumanOverrideStatusUseCase } from "@/conversations/application/UpdateHumanOverrideStatus.application";
import { FindConversationByUserIdUseCase } from "@/conversations/application/FindConversationByUserId.application";
import { GetConversationsUseCase } from "@/conversations/application/GetConversations.application";
import { UpdateTitleUseCase } from "@/conversations/application/UpdateTitle.application";
import { FindUserByPhoneUseCase } from "@/users/application/FindByPhone.application";
import { ApiResponse } from "@/shared/application/ApiResponse";

import { ConversationRepository } from "@/conversations/infrastructure/repositories/Conversation.repository";
import { MessageRepository } from "@/messages/infrastructure/repositories/Message.repository";
import { UserRepository } from "@/users/infrastructure/repositories/User.repository";

import { InsertMessageWithUserDTO } from "@/conversations/application/DTOs/InsertMessageWithUserDTO";

import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";

import { Request, Response } from "express";

export class ConversationController {
  private readonly insertMessageUseCase: EnsureUserAndInsertMessageUseCase;
  private readonly getConversationsUseCase: GetConversationsUseCase;
  private readonly findConversationByUserIdUseCase: FindConversationByUserIdUseCase;
  private readonly findUserByPhoneUseCase: FindUserByPhoneUseCase;
  private readonly updateHumanOverrideStatusUseCase: UpdateHumanOverrideStatusUseCase;
  private readonly updateTitleUseCase: UpdateTitleUseCase;

  constructor() {
    const userRepository = new UserRepository();
    const messageRepository = new MessageRepository();
    const conversationRepository = new ConversationRepository();
    this.insertMessageUseCase = new EnsureUserAndInsertMessageUseCase(
      userRepository,
      messageRepository,
      conversationRepository
    );
    this.getConversationsUseCase = new GetConversationsUseCase(
      conversationRepository,
      userRepository
    );
    this.findConversationByUserIdUseCase = new FindConversationByUserIdUseCase(
      conversationRepository
    );
    this.findUserByPhoneUseCase = new FindUserByPhoneUseCase(userRepository);
    this.updateHumanOverrideStatusUseCase =
      new UpdateHumanOverrideStatusUseCase(conversationRepository);
    this.updateTitleUseCase = new UpdateTitleUseCase(conversationRepository);
  }

  private detectCategory(
    mimeType: string
  ): "image" | "audio" | "video" | "file" {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
  }

  async insertMessage(req: Request, res: Response): Promise<void> {
    try {
      const { senderType, phone, name, content } = req.body;
      const file = req.file;

      if (!senderType || !["user", "ai", "admin"].includes(senderType)) {
        res.status(400).json({
          success: false,
          message: "Invalid senderType. Must be 'user', 'ai' or 'admin'.",
          error: {
            code: "INVALID_SENDER_TYPE",
            message: "senderType must be 'user', 'ai' or 'admin'",
          },
        });
        return;
      }

      if (!phone) {
        res.status(400).json({
          success: false,
          message: "Phone is required.",
          error: { code: "MISSING_PHONE", message: "Missing phone field" },
        });
        return;
      }

      if (typeof content !== "string") {
        res.status(400).json({
          success: false,
          message: "Content is required and must be a string.",
          error: { code: "INVALID_CONTENT", message: "Missing content field" },
        });
        return;
      }

      let obj: InsertMessageWithUserDTO;

      if (senderType === "user") {
        obj = { senderType, phone, name, content };
      } else if (senderType === "ai" || senderType === "admin") {
        obj = { senderType, phone, content };
      } else {
        // Fallback de seguridad (TypeScript exige todas las rutas)
        res.status(400).json({
          success: false,
          message: "Invalid senderType. Must be 'user', 'ai' or 'admin'.",
          error: {
            code: "INVALID_SENDER_TYPE",
            message: "senderType must be 'user', 'ai' or 'admin'",
          },
        });
        return;
      }

      // Si hay archivo, agregamos `media`
      if (file) {
        obj.media = {
          fileBuffer: file.buffer,
          fileName: file.originalname,
          mimeType: file.mimetype,
          category: this.detectCategory(file.mimetype),
        };
      }

      const useCaseResult = await this.insertMessageUseCase.execute(obj);

      if (!useCaseResult.success) {
        res.status(400).json(useCaseResult);
        return;
      }

      res.status(200).json(useCaseResult);
    } catch (error) {
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
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, human_override, minMessages } = req.query;

      const filters: {
        from?: Date;
        to?: Date;
        humanOverride?: boolean;
        minMessages?: number;
      } = {};

      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (typeof human_override === "string")
        filters.humanOverride = human_override === "true";
      if (minMessages && !isNaN(Number(minMessages)))
        filters.minMessages = Number(minMessages);

      const useCaseResult: ApiResponse<ConversationInterface[]> =
        await this.getConversationsUseCase.execute(filters);

      if (!useCaseResult.success) {
        res
          .status(useCaseResult.data?.length === 0 ? 404 : 400)
          .json(useCaseResult);
        return;
      }

      res.status(200).json(useCaseResult);
      return;
    } catch (error) {
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

  async getConversationByPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.params;

      if (!phone) {
        res.status(400).json({
          success: false,
          message: "Phone is required",
          error: {
            code: "MISSING_PARAM",
            message: "Missing 'phone' parameter in request",
          },
        });
        return;
      }

      const userResult = await this.findUserByPhoneUseCase.execute(phone);

      if (!userResult.data) {
        res.status(404).json({
          success: userResult.success,
          message: userResult.message,
          error: {
            code: "USER_NOT_FOUND",
            message: `No user found with phone ${phone}`,
          },
        });
        return;
      }

      const conversationResult =
        await this.findConversationByUserIdUseCase.execute(userResult.data.id);

      if (!conversationResult.data) {
        res.status(404).json({
          success: conversationResult.success,
          message: conversationResult.message,
          error: {
            code: "CONVERSATION_NOT_FOUND",
            message: `No conversation found for user ${userResult.data.id}`,
          },
        });
        return;
      }

      res.status(200).json(conversationResult);
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

  async updateHumanOverrideStatus(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "conversationId is required",
          error: {
            code: "MISSING_PARAM",
            message: "Missing 'conversationId' parameter in request",
          },
        });
        return;
      }

      const { enabled } = req.body;

      if (enabled === undefined || typeof enabled !== "boolean") {
        res.status(400).json({
          success: false,
          message: "enabled is required and must be a boolean.",
          error: { code: "INVALID_CONTENT", message: "Missing content field" },
        });
        return;
      }

      const result = await this.updateHumanOverrideStatusUseCase.execute(
        enabled,
        conversationId
      );

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error ?? {
            code: "UNKNOWN_ERROR",
            message: "Failed to update human override status",
          },
        });
        return;
      }

      res.status(200).json(result);
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

  async updateTitle(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "conversationId is required",
          error: {
            code: "MISSING_PARAM",
            message: "Missing 'conversationId' parameter in request",
          },
        });
        return;
      }

      const { title } = req.body;

      if (!title || typeof title !== "string") {
        res.status(400).json({
          success: false,
          message: "title is required and must be a string.",
          error: { code: "INVALID_CONTENT", message: "Missing title field" },
        });
        return;
      }

      const result = await this.updateTitleUseCase.execute(
        title,
        conversationId
      );

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error ?? {
            code: "UNKNOWN_ERROR",
            message: "Failed to update title",
          },
        });
        return;
      }

      res.status(200).json(result);
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
