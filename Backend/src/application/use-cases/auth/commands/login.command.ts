import { ICommand } from "../../../cqrs/interfaces";
import { Validate } from "../../../cqrs/decorators";
import { loginSchema } from "./login.validation";

@Validate(loginSchema)
export class LoginCommand implements ICommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}
