import { ConversationRepositoryInterface } from "@/conversations/domain/interfaces/ConversationRepository.interface";
import { MessageRepositoryInterface } from "@/messages/domain/interfaces/MessageRepository.interface";
import { UserRepositoryInterface } from "@/users/domain/interfaces/UserRepository.interface";

import { InsertMessageWithUserResponseDTO } from "@/conversations/application/DTOs/InsertMessageWithUserResponseDTO";
import { InsertMessageWithUserDTO } from "@/conversations/application/DTOs/InsertMessageWithUserDTO";

import { FindConversationByUserIdUseCase } from "@/conversations/application/FindConversationByUserId.application";
import { InsertConversationUseCase } from "@/conversations/application/InsertConversation.application";
import { InsertMessageUseCase } from "@/messages/application/InsertMessage.application";
import { InsertUserUseCase } from "@/users/application/InsertUser.application";
import { ApiResponse } from "@/shared/application/ApiResponse";

import { ConversationInterface } from "@/conversations/domain/interfaces/Conversation.interface";
import { UserInterface } from "@/users/domain/interfaces/User.interface";

export class EnsureUserAndInsertMessageUseCase {
  private readonly insertUserUseCase: InsertUserUseCase;
  private readonly insertMessageUseCase: InsertMessageUseCase;
  private readonly insertConversationUserCase: InsertConversationUseCase;
  private readonly findConversationByUserIdUseCase: FindConversationByUserIdUseCase;

  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly conversationRepository: ConversationRepositoryInterface
  ) {
    this.insertUserUseCase = new InsertUserUseCase(this.userRepository);
    this.insertMessageUseCase = new InsertMessageUseCase(
      this.messageRepository
    );
    this.insertConversationUserCase = new InsertConversationUseCase(
      this.conversationRepository
    );
    this.findConversationByUserIdUseCase = new FindConversationByUserIdUseCase(
      this.conversationRepository
    );
  }

  /**
   * Devuelve usuario (creado u obtenido), conversación (creada u obtenida) y flag createdUser.
   * Si createUserIfMissing = false y el usuario no existe => devuelve { error }.
   */
  private async ensureUserAndConversationByPhone(
    phone: string,
    name: string | undefined,
    createUserIfMissing: boolean
  ): Promise<
    | {
        user: UserInterface;
        conversation: ConversationInterface;
        createdUser: boolean;
      }
    | {
        error: ApiResponse<never>["error"];
      }
  > {
    let createdUser = false;

    // 1) Usuario
    let user = await this.userRepository.findByPhone(phone);

    if (!user) {
      if (!createUserIfMissing) {
        return {
          error: {
            code: "USER_NOT_FOUND",
            message: "Cannot proceed without an existing user",
          },
        };
      }

      const userRes = await this.insertUserUseCase.execute({
        phone,
        name: name ?? "No name",
      });

      if (!userRes.success || !userRes.data) {
        return {
          error:
            userRes.error ??
            ({
              code: "USER_CREATION_FAILED",
              message: "Could not create user",
            }),
        };
      }

      user = userRes.data;
      createdUser = true;
    }

    // 2) Conversación existente
    console.log("Buscado conversacion...");
    
    const convRes = await this.findConversationByUserIdUseCase.execute(user.id);
    let conversation = convRes.data ?? null;

    console.log("busqueda de conversacion terminada" + " --> " +  conversation);
    
    // 3) Crear conversación si no existe
    if (!conversation) {
      console.log("La conversacion no existe la vamos a crear");
      console.log("CReadndo");
      
      const convCreateRes = await this.insertConversationUserCase.execute({
        user_id: user.id,
        title: `${user.phone} - ${user.name}`,
      });

      console.log("la creacion de la conversacion termino, salio bien ?");
      

      if (!convCreateRes.success || !convCreateRes.data) {
        console.log("Error al crear la conversacion");
        
        return {
          error:
            convCreateRes.error ??
            ({
              code: "CONVERSATION_CREATION_FAILED",
              message: "Could not create conversation",
            }),
        };
      }

      console.log("Conversacion creado correctamente -> " + conversation);
      

      conversation = convCreateRes.data;
    }

    return { user, conversation, createdUser };
  }

  /**
   * Inserta un mensaje en la conversación indicada y devuelve ApiResponse tipado.
   */
  private async insertMessageAndBuildResponse(
    conversation: ConversationInterface,
    payload: {
      content: string;
      sender: "user" | "ai";
      senderInfo: { id: string; name?: string; phone?: string };
      createdUser: boolean;
    }
  ): Promise<ApiResponse<InsertMessageWithUserResponseDTO>> {
    const messageRes = await this.insertMessageUseCase.execute({
      conversation_id: conversation.id,
      content: payload.content,
      sender: payload.sender,
    });

    if (!messageRes.success || !messageRes.data) {
      return {
        success: false,
        message: "Failed to create message",
        error: messageRes.error ?? {
          code: "MESSAGE_CREATION_FAILED",
          message: "Could not create message",
        },
      };
    }

    return {
      success: true,
      message:
        payload.sender === "user"
          ? "Message created successfully"
          : "AI message created successfully",
      data: {
        messageId: messageRes.data.id,
        content: payload.content,
        timestamp: messageRes.data.sent_at,
        sender:
          payload.sender === "user"
            ? {
                id: payload.senderInfo.id,
                phone: payload.senderInfo.phone!,
                name: payload.senderInfo.name!,
              }
            : {
                id: payload.senderInfo.id,
                name: payload.senderInfo.name ?? "AI",
              },
        createdUser: payload.createdUser,
      },
    };
  }

  async execute(
    dto: InsertMessageWithUserDTO
  ): Promise<ApiResponse<InsertMessageWithUserResponseDTO>> {
    if (dto.senderType === "user") {
      // Flujo USER: crea usuario si no existe
      const ensured = await this.ensureUserAndConversationByPhone(
        dto.phone,
        dto.name,
        /* createUserIfMissing */ true
      );

      if ("error" in ensured) {
        return {
          success: false,
          message: "Failed to ensure user/conversation",
          error: ensured.error ?? {
            code: "UNKNOWN_ERROR",
            message: "Unknown error ensuring user/conversation",
          },
        };
      }

      const { user, conversation, createdUser } = ensured;

      return this.insertMessageAndBuildResponse(conversation, {
        content: dto.content,
        sender: "user",
        senderInfo: { id: user.id, name: user.name, phone: user.phone },
        createdUser,
      });
    }

    if (dto.senderType === "ai") {
      // Flujo AI: NO crea usuario si no existe (pero sí crea conversación si falta)
      const ensured = await this.ensureUserAndConversationByPhone(
        dto.phone,
        /* name */ undefined,
        /* createUserIfMissing */ false
      );

      if ("error" in ensured) {
        return {
          success: false,
          message: "User not found for AI message",
          error: ensured.error ?? {
            code: "UNKNOWN_ERROR",
            message: "Unknown error ensuring user/conversation for AI",
          },
        };
      }

      const { conversation } = ensured;

      return this.insertMessageAndBuildResponse(conversation, {
        content: dto.content,
        sender: "ai",
        senderInfo: { id: "ai-system", name: "AI" },
        createdUser: false,
      });
    }

    // Chequeo exhaustivo para discriminated union (nunca debería alcanzarse)
    const _exhaustiveCheck: never = dto;
    return {
      success: false,
      message: "Invalid senderType",
      error: {
        code: "INVALID_SENDER_TYPE",
        message: "senderType must be 'user' or 'ai'",
      },
    };
  }
}
