import { injectable, inject } from "inversify";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetCurrentUserQuery } from "./get-current-user.query";
import { QueryHandler } from "../../../../cqrs/decorators";
import { TYPES } from "../../../../../shared/types/common.types";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { User } from "../../../../../domain/entities/users/user.entity";
import { Result } from "../../../../../shared/result";
import { IUserContext } from "../../../../ports/user-context.interface";
import { Error } from "../../../../../shared/error";

@injectable()
@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<
  GetCurrentUserQuery,
  User
> {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserContext) private userContext: IUserContext,
  ) {}

  async handle(query: GetCurrentUserQuery): Promise<Result<User>> {
    const userId = this.userContext.userId;

    if (!userId) {
      return Result.failure<User>(
        Error.unauthorized("UserContext.Missing", "User context is missing"),
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.failure<User>(
        Error.notFound("User.NotFound", `User with ID ${userId} not found`),
      );
    }

    return Result.success(user);
  }
}
