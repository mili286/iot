import { inject, injectable } from "inversify";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { UserDto } from "../get-current-user/get-current-user.dto";
import { QueryHandler } from "../../../../cqrs/decorators";
import { Error } from "../../../../../shared/error";

@injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserDto | null
> {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  async handle(query: GetUserByIdQuery): Promise<Result<UserDto | null>> {
    const user = await this.userRepository.findById(query.id);

    if (!user) {
      return Result.failure<UserDto | null>(
        Error.notFound("User.NotFound", "User not found"),
      );
    }

    const dto = {
      id: user._id.toString(),
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return Result.success<UserDto | null>(dto);
  }
}
