import { inject, injectable } from "inversify";
import { CommandHandler } from "../../../../cqrs/decorators";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { SaveRecordingCommand } from "./save-recording.command";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
import { SaveRecordingDto } from "./save-recording.dto";

@injectable()
@CommandHandler(SaveRecordingCommand)
export class SaveRecordingHandler implements ICommandHandler<
  SaveRecordingCommand,
  SaveRecordingDto
> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
  ) {}

  async handle(
    command: SaveRecordingCommand,
  ): Promise<Result<SaveRecordingDto>> {
    const recording = await this.recordingRepository.create({
      filename: command.filename,
      path: command.path,
      mimetype: command.mimetype,
      size: command.size,
    });

    return Result.success({
      id: recording._id.toString(),
      filename: recording.filename,
      path: recording.path,
      mimetype: recording.mimetype,
      size: recording.size,
    });
  }
}
