import { ICommand } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { registerUserSchema } from "./register-user.validation";
import { RegisterUserDto } from "./register-user.dto";

@Validate(registerUserSchema)
export class RegisterUserCommand implements ICommand<RegisterUserDto> {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
