import { injectable, inject } from "inversify";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetCurrentUserQuery } from "./get-current-user.query";
import { QueryHandler } from "../../../../cqrs/decorators";
import { TYPES } from "../../../../../shared/types/common.types";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { Result } from "../../../../../shared/result";
import { IUserContext } from "../../../../ports/user-context.interface";
import { Error } from "../../../../../shared/error";
import { UserDto } from "./get-current-user.dto";

@injectable()
@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<
  GetCurrentUserQuery,
  UserDto
> {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.UserContext) private userContext: IUserContext,
  ) {}

  async handle(query: GetCurrentUserQuery): Promise<Result<UserDto>> {
    const userId = this.userContext.userId;

    if (!userId) {
      return Result.failure<UserDto>(
        Error.unauthorized("Unauthorized", "You are unauthorized"),
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.failure<UserDto>(
        Error.unauthorized("Unauthorized", "You are unauthorized"),
      );
    }

    return Result.success({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
