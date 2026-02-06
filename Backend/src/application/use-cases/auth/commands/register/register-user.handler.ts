import { injectable, inject } from "inversify";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { RegisterUserCommand } from "./register-user.command";
import { CommandHandler } from "../../../../cqrs/decorators";
import { TYPES } from "../../../../../shared/types/common.types";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";
import { Result } from "../../../../../shared/result";
import { RegisterUserDto } from "./register-user.dto";

@injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, RegisterUserDto>
{
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  async handle(command: RegisterUserCommand): Promise<Result<RegisterUserDto>> {
    const user = await this.userRepository.register(
      {
        username: command.username,
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
      },
      command.password,
    );
    return Result.success({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  }
}
