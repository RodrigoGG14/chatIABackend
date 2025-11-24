import { ConversationRepositoryInterface } from "../domain/interfaces/ConversationRepository.interface";
import { FindConversationByUserIdUseCase } from "./FindConversationByUserId.application";
import { InsertConversationUseCase } from "./InsertConversation.application";

import { MessageAttachmentRepository } from "../../messageAttachments/infrastructure/repositories/MessageAttachment.repository";
import { UploadAttachmentUseCase } from "../../messageAttachments/application/UploadAttachment.application";
import { MessageRepositoryInterface } from "../../messages/domain/interfaces/MessageRepository.interface";
import { UserRepositoryInterface } from "../../users/domain/interfaces/UserRepository.interface";

import { InsertMessageWithUserResponseDTO } from "./../../conversations/application/DTOs/InsertMessageWithUserResponseDTO";
import { InsertMessageWithUserDTO } from "../../conversations/application/DTOs/InsertMessageWithUserDTO";

import { InsertMessageUseCase } from "../../messages/application/InsertMessage.application";
import { InsertUserUseCase } from "../../users/application/InsertUser.application";
import { ApiResponse } from "../../shared/application/ApiResponse";

import { ConversationInterface } from "../../conversations/domain/interfaces/Conversation.interface";
import { UserInterface } from "../../users/domain/interfaces/User.interface";

export class EnsureUserAndInsertMessageUseCase {
  private readonly insertUserUseCase: InsertUserUseCase;
  private readonly insertMessageUseCase: InsertMessageUseCase;
  private readonly insertConversationUserCase: InsertConversationUseCase;
  private readonly findConversationByUserIdUseCase: FindConversationByUserIdUseCase;
  private readonly uploadAttachmentUseCase: UploadAttachmentUseCase;

  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly conversationRepository: ConversationRepositoryInterface,
    private readonly attachmentRepository = new MessageAttachmentRepository()
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
    this.uploadAttachmentUseCase = new UploadAttachmentUseCase(
      this.attachmentRepository
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
          error: userRes.error ?? {
            code: "USER_CREATION_FAILED",
            message: "Could not create user",
          },
        };
      }

      user = userRes.data;
      createdUser = true;
    }

    // 2) Conversación existente
    console.log("Buscado conversacion...");

    const convRes = await this.findConversationByUserIdUseCase.execute(user.id);
    let conversation = convRes.data ?? null;

    console.log("busqueda de conversacion terminada" + " --> " + conversation);

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
          error: convCreateRes.error ?? {
            code: "CONVERSATION_CREATION_FAILED",
            message: "Could not create conversation",
          },
        };
      }

      console.log("Conversacion creado correctamente -> " + conversation);

      conversation = convCreateRes.data;
    }

    return { user, conversation, createdUser };
  }

  // Solo muestro los cambios clave dentro de execute()
  async execute(
    dto: InsertMessageWithUserDTO
  ): Promise<ApiResponse<InsertMessageWithUserResponseDTO>> {
    if (dto.senderType === "user") {
      // USAR RPC para atomicidad de user+conversation+message
      try {
        const nameValue = dto.name ?? "";
        const { message_id, user_id } =
          await this.conversationRepository.insertMessageCascade({
            phone: dto.phone,
            name: nameValue,
            content: dto.content, // puede ser ""
            sender: "user",
          });

        // Si viene media, subirla; si falla, borramos el mensaje insertado por el RPC
        if (dto.media) {
          const uploadRes = await this.uploadAttachmentUseCase.execute({
            messageId: message_id,
            fileBuffer: dto.media.fileBuffer,
            fileName: dto.media.fileName,
            mimeType: dto.media.mimeType,
            category: dto.media.category,
          });

          if (!uploadRes.success) {
            // rollback compensatorio del mensaje
            await this.messageRepository.deleteById(message_id);
            return {
              success: false,
              message: "Upload failed, message rolled back",
              error: uploadRes.error ?? {
                code: "UPLOAD_FAILED",
                message: "Attachment upload failed",
              },
            };
          }
        }

        // Puedes recuperar datos del usuario si quieres mostrarlos (opcional).
        // Aquí armamos la respuesta mínima.
        return {
          success: true,
          message: "Message created successfully",
          data: {
            messageId: message_id,
            content: dto.content,
            timestamp: new Date().toISOString(), // Si necesitas exacto, consulta el mensaje
            sender: {
              id: user_id,
              name: dto.name ?? "No name",
              phone: dto.phone,
            },
            createdUser: false,
          },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown RPC error";
        return {
          success: false,
          message: "Failed to create message with RPC",
          error: { code: "RPC_ERROR", message: msg },
        };
      }
    }

    if (dto.senderType === "ai" || dto.senderType === "admin") {
      // Flujo AI: NO crear usuario si no existe (misma lógica que ya manejabas)
      const ensured = await this.ensureUserAndConversationByPhone(
        dto.phone,
        undefined,
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

      // Insertar mensaje AI "normal"
      const baseRes = await this.insertMessageUseCase.execute({
        conversation_id: conversation.id,
        content: dto.content,
        sender: dto.senderType,
      });

      if (!baseRes.success || !baseRes.data) {
        return {
          success: false,
          message: "Failed to create AI message",
          error: baseRes.error ?? {
            code: "MESSAGE_CREATION_FAILED",
            message: "Could not create AI message",
          },
        };
      }

      // Si IA algún día adjunta archivos, los subes también (opcional)
      if (dto.media) {
        const uploadRes = await this.uploadAttachmentUseCase.execute({
          messageId: baseRes.data.id,
          fileBuffer: dto.media.fileBuffer,
          fileName: dto.media.fileName,
          mimeType: dto.media.mimeType,
          category: dto.media.category,
        });

        if (!uploadRes.success) {
          // rollback del mensaje AI
          await this.messageRepository.deleteById(baseRes.data.id);
          return {
            success: false,
            message: `Upload failed, ${dto.senderType.toUpperCase()} message rolled back`,
            error: uploadRes.error ?? {
              code: "UPLOAD_FAILED",
              message: "Attachment upload failed",
            },
          };
        }
      }

      return {
        success: true,
        message: `${dto.senderType.toUpperCase()} message created successfully`,
        data: {
          messageId: baseRes.data.id,
          content: dto.content,
          timestamp: baseRes.data.sent_at,
          sender: {
            id: dto.senderType === "ai" ? "ai-system" : "admin-system",
            name: dto.senderType === "ai" ? "AI" : "Admin",
          },
          createdUser: false,
        },
      };
    }

    return {
      success: false,
      message: "Invalid senderType",
      error: {
        code: "INVALID_SENDER_TYPE",
        message: "senderType must be 'user', 'ai' or 'admin'",
      },
    };
  }
}
