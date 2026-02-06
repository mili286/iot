import { inject, injectable } from "inversify";
import { QueryHandler } from "../../../../cqrs/decorators";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
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
  ) {}

  async handle(
    query: GetRecordingByIdQuery,
  ): Promise<Result<RecordingDetailDto | null>> {
    const recording = await this.recordingRepository.findById(query.id);
    if (!recording)
      return Result.failure(
        Error.failure("Recording.Get", "Recording not found"),
      );
    return Result.success({
      id: recording._id.toString(),
      filename: recording.filename,
      path: recording.path,
      mimetype: recording.mimetype,
      size: recording.size,
      timestamp: recording.timestamp,
    });
  }
}
