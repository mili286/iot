import { inject, injectable } from "inversify";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { DeleteRecordingCommand } from "./delete-recording.command";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
import fs from "fs";
import path from "path";

import { CommandHandler } from "../../../../cqrs/decorators";
import { Error } from "../../../../../shared/error";

@injectable()
@CommandHandler(DeleteRecordingCommand)
export class DeleteRecordingHandler implements ICommandHandler<DeleteRecordingCommand> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
  ) {}

  async handle(command: DeleteRecordingCommand): Promise<Result<void>> {
    const recording = await this.recordingRepository.findById(command.id);

    if (!recording) {
      return Result.failure<void>(
        Error.notFound("Recording.NotFound", "Recording not found"),
      );
    }

    // Delete file from disk if exists
    if (recording.path) {
      const filePath = path.resolve(recording.path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
          // Continue deleting from DB even if file deletion fails
        }
      }
    }

    const deleted = await this.recordingRepository.delete(command.id);

    if (!deleted) {
      return Result.failure<void>(
        Error.failure(
          "Recording.Delete",
          "Failed to delete recording from database",
        ),
      );
    }

    return Result.success<void>();
  }
}
