import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { QueryBus } from "../../../application/cqrs/bus";
import { GetSystemParametersQuery } from "../../../application/use-cases/system/queries/get-parameters/get-parameters.query";
import { createResult } from "../infrastructure/custom-results";
import { SystemParametersDto } from "../../../application/use-cases/system/queries/get-parameters/get-parameters.dto";

@injectable()
export class SystemParametersController {
  constructor(
    @inject(TYPES.QueryBus) private queryBus: QueryBus,
  ) {}

  async getParameters(req: Request, res: Response): Promise<void> {
    const result = await this.queryBus.execute<SystemParametersDto>(
      new GetSystemParametersQuery(),
    );
    createResult(res, result);
  }
}
