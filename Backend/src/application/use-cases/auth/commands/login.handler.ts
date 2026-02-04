import { injectable, inject } from "inversify";
import { ICommandHandler } from "../../../cqrs/interfaces";
import { LoginCommand } from "./login.command";
import { CommandHandler } from "../../../cqrs/decorators";
import { TYPES } from "../../../../shared/types/common.types";
import { AuthService } from "../../../services/auth.service";
import UserModel from "../../../../domain/entities/users/user.entity";
import { Result } from "../../../../shared/result";
import { Error } from "../../../../shared/error";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResponse> {
  constructor(
    @inject(TYPES.AuthService) private authService: AuthService
  ) {}

  async handle(command: LoginCommand): Promise<Result<LoginResponse>> {
    try {
      // Use passport-local-mongoose's authenticate method
      const { user, error } = await (UserModel as any).authenticate()(
        command.username,
        command.password
      );

      if (error || !user) {
        return Result.failure<LoginResponse>(
          Error.unauthorized("Auth.LoginFailed", error?.message || "Invalid username or password")
        );
      }

      const token = this.authService.generateToken(user);

      return Result.success<LoginResponse>({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (err: any) {
      return Result.failure<LoginResponse>(
        Error.failure("Auth.UnexpectedError", err.message || "An unexpected error occurred during login")
      );
    }
  }
}
