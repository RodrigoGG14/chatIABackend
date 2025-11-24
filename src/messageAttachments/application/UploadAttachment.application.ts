import { SupabaseService } from "../../shared/infrastructure/supabase/SupabaseClient";
import { MessageAttachmentInterface } from "../domain/interfaces/MessageAttachment.interface";
import { MessageAttachmentRepositoryInterface } from "../domain/interfaces/MessageAttachmentRepository.interface";
import { ApiResponse } from "../../shared/application/ApiResponse";


interface UploadAttachmentDTO {
  messageId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  category: "image" | "audio" | "video" | "file";
}

export class UploadAttachmentUseCase {
  private readonly client = new SupabaseService().getClient();

  constructor(
    private readonly attachmentRepository: MessageAttachmentRepositoryInterface
  ) {}

  // Normaliza nombres de archivos para evitar errores en Supabase.
  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
  }

  async execute(
    dto: UploadAttachmentDTO
  ): Promise<ApiResponse<MessageAttachmentInterface>> {
    try {
      const sanitizedFileName = this.sanitizeFileName(dto.fileName);

      // 1️⃣ Subir archivo al bucket correcto (por categoría)
      const folder = `${dto.category}s`;
      const storagePath = `${folder}/${Date.now()}_${sanitizedFileName}`;

      const { data, error: uploadError } = await this.client.storage
        .from("user-media-assets")
        .upload(storagePath, dto.fileBuffer, {
          contentType: dto.mimeType,
        });

      if (uploadError) {
        return {
          success: false,
          message: "Error uploading file to storage",
          error: {
            code: "UPLOAD_FAILED",
            message: uploadError.message,
          },
        };
      }

      const record = await this.attachmentRepository.insertAttachment({
        message_id: dto.messageId,
        file_path: data?.path ?? storagePath,
        mime_type: dto.mimeType,
        category: dto.category,
        file_name: dto.fileName,
      });

      return {
        success: true,
        message: "Attachment uploaded successfully",
        data: record,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown server error";
      return {
        success: false,
        message: "Error uploading attachment",
        error: {
          code: "ATTACHMENT_ERROR",
          message,
        },
      };
    }
  }
}
