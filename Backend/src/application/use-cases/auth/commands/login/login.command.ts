import { ICommand } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { loginSchema } from "./login.validation";
import { LoginDto } from "./login.dto";

@Validate(loginSchema)
export class LoginCommand implements ICommand<LoginDto> {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}
