import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { QueryBus } from "../../../application/cqrs/bus";
import { GetCurrentUserQuery } from "../../../application/use-cases/users/queries/get-current-user/get-current-user.query";
import { GetUsersQuery } from "../../../application/use-cases/users/queries/get-users/get-users.query";
import { GetUserByIdQuery } from "../../../application/use-cases/users/queries/get-user-by-id/get-user-by-id.query";
import { createResult } from "../infrastructure/custom-results";
import { UserDto } from "../../../application/use-cases/users/queries/get-current-user/get-current-user.dto";
import { GetCurrentUserRequest, GetUsersRequest, GetUserByIdRequest } from "../requests/user.requests";

@injectable()
export class UserController {
  constructor(@inject(TYPES.QueryBus) private queryBus: QueryBus) {}

  async getCurrentUser(req: GetCurrentUserRequest, res: Response): Promise<void> {
    const result = await this.queryBus.execute<UserDto>(
      new GetCurrentUserQuery(),
    );
    createResult(res, result);
  }

  async getUsers(req: GetUsersRequest, res: Response): Promise<void> {
    const result = await this.queryBus.execute<UserDto[]>(new GetUsersQuery());
    createResult(res, result);
  }

  async getUserById(req: GetUserByIdRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.queryBus.execute<UserDto | null>(
      new GetUserByIdQuery(id.toString()),
    );
    createResult(res, result);
  }
}
