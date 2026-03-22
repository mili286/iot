import { inject, injectable } from "inversify";
import { QueryHandler } from "../../../../cqrs/decorators";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetSystemParametersQuery } from "./get-parameters.query";
import { SystemParametersDto } from "./get-parameters.dto";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { ISystemParametersRepository } from "../../../../../domain/repositories/system-parameters.repository.interface";

@injectable()
@QueryHandler(GetSystemParametersQuery)
export class GetSystemParametersHandler implements IQueryHandler<
  GetSystemParametersQuery,
  SystemParametersDto
> {
  constructor(
    @inject(TYPES.SystemParametersRepository)
    private systemParametersRepository: ISystemParametersRepository,
  ) {}

  async handle(query: GetSystemParametersQuery): Promise<Result<SystemParametersDto>> {
    const parameters = await this.systemParametersRepository.getParameters();
    
    return Result.success({
      recordingsCount: parameters.recordingsCount,
      totalRecordingsDuration: parameters.totalRecordingsDuration,
      motionEventsCount: parameters.motionEventsCount,
      status: parameters.status,
      resolution: parameters.resolution,
      lastUpdated: parameters.lastUpdated.toISOString(),
    });
  }
}
