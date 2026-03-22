import { inject, injectable } from "inversify";
import { QueryHandler } from "../../../../cqrs/decorators";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { Error } from "../../../../../shared/error";
import { GetRecordingByIdQuery } from "./get-recording-by-id.query";
import { RecordingDetailDto } from "./get-recording-by-id.dto";

@injectable()
@QueryHandler(GetRecordingByIdQuery)
export class GetRecordingByIdHandler implements IQueryHandler<
  GetRecordingByIdQuery,
  RecordingDetailDto | null
> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
  ) {}

  async handle(
    query: GetRecordingByIdQuery,
  ): Promise<Result<RecordingDetailDto | null>> {
    const recording = await this.recordingRepository.findById(query.id);
    if (!recording)
      return Result.failure(
        Error.failure("Recording.Get", "Recording not found"),
      );

    let userName: string | undefined;
    if (recording.userId) {
      const user = await this.userRepository.findById(recording.userId);
      if (user) {
        userName = `${user.firstName} ${user.lastName}`;
      }
    }

    return Result.success({
      id: recording._id.toString(),
      filename: recording.filename,
      path: recording.path,
      mimetype: recording.mimetype,
      size: recording.size,
      duration: recording.duration,
      timestamp: recording.timestamp,
      triggerType: recording.triggerType,
      recordingDate: recording.recordingDate,
      syncDate: recording.syncDate,
      userId: recording.userId,
      userName,
    });
  }
}
