import { inject, injectable } from "inversify";
import { IQueryHandler } from "../../../../cqrs/interfaces";
import { GetUsersQuery } from "./get-users.query";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { UserDto } from "../get-current-user/get-current-user.dto";
import { QueryHandler } from "../../../../cqrs/decorators";

@injectable()
@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<
  GetUsersQuery,
  UserDto[]
> {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  async handle(query: GetUsersQuery): Promise<Result<UserDto[]>> {
    const users = await this.userRepository.findAll();

    const dtos = users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    return Result.success<UserDto[]>(dtos);
  }
}
