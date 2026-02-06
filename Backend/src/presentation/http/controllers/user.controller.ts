import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { QueryBus } from "../../../application/cqrs/bus";
import { GetCurrentUserQuery } from "../../../application/use-cases/users/queries/get-current-user/get-current-user.query";
import { createResult } from "../infrastructure/custom-results";
import { UserDto } from "../../../application/use-cases/users/queries/get-current-user/get-current-user.dto";
import { GetCurrentUserRequest } from "../requests/user.requests";

@injectable()
export class UserController {
  constructor(@inject(TYPES.QueryBus) private queryBus: QueryBus) {}

  async getCurrentUser(req: GetCurrentUserRequest, res: Response): Promise<void> {
    const result = await this.queryBus.execute<UserDto>(
      new GetCurrentUserQuery(),
    );
    createResult(res, result);
  }
}
