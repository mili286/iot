import { inject, injectable } from "inversify";
import { QueryHandler } from "../../../../cqrs/decorators";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetRecordingsQuery } from "./get-recordings.query";
import { RecordingDto } from "./get-recordings.dto";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";

@injectable()
@QueryHandler(GetRecordingsQuery)
export class GetRecordingsHandler implements IQueryHandler<
  GetRecordingsQuery,
  RecordingDto[]
> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
  ) {}

  async handle(query: GetRecordingsQuery): Promise<Result<RecordingDto[]>> {
    const recordings = await this.recordingRepository.findAll();
    const dtos: RecordingDto[] = recordings.map((recording) => ({
      id: recording._id.toString(),
      filename: recording.filename,
      path: recording.path,
      mimetype: recording.mimetype,
      size: recording.size,
      timestamp: recording.timestamp,
    }));
    return Result.success(dtos);
  }
}
