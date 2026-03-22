import { inject, injectable } from "inversify";
import { QueryHandler } from "../../../../cqrs/decorators";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetRecordingsQuery } from "./get-recordings.query";
import { RecordingDto } from "./get-recordings.dto";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";

@injectable()
@QueryHandler(GetRecordingsQuery)
export class GetRecordingsHandler implements IQueryHandler<
  GetRecordingsQuery,
  RecordingDto[]
> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,
  ) {}

  async handle(query: GetRecordingsQuery): Promise<Result<RecordingDto[]>> {
    const recordings = await this.recordingRepository.findAll(query.page, query.limit);
    
    const dtos: RecordingDto[] = await Promise.all(recordings.map(async (recording) => {
      let userName: string | undefined;
      if (recording.userId) {
        const user = await this.userRepository.findById(recording.userId);
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
        }
      }

      return {
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
      };
    }));
    return Result.success(dtos);
  }
}
