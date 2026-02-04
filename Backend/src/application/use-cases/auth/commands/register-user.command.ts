import { ICommand } from "../../../cqrs/interfaces";
import { Validate } from "../../../cqrs/decorators";
import { registerUserSchema } from "./register-user.validation";

@Validate(registerUserSchema)
export class RegisterUserCommand implements ICommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
