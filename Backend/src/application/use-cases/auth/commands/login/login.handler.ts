import { injectable, inject } from "inversify";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { LoginCommand } from "./login.command";
import { CommandHandler } from "../../../../cqrs/decorators";
import { TYPES } from "../../../../../shared/types/common.types";
import userEntity from "../../../../../domain/entities/users/user.entity";
import { Result } from "../../../../../shared/result";
import { Error } from "../../../../../shared/error";
import { LoginDto } from "./login.dto";
import { IAuthService } from "../../../../ports/auth.service.interface";

@injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginDto> {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  async handle(command: LoginCommand): Promise<Result<LoginDto>> {
    try {
      const { user, error } = await (userEntity as any).authenticate()(
        command.username,
        command.password,
      );

      if (error || !user) {
        return Result.failure<LoginDto>(
          Error.unauthorized(
            "Auth.LoginFailed",
            error?.message || "Invalid username or password",
          ),
        );
      }

      const authToken = this.authService.generateAccessToken(user);
      const refreshToken = this.authService.generateRefreshToken();
      this.authService.setRefreshToken(user.id, refreshToken);

      return Result.success<LoginDto>({
        authToken: authToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (err: any) {
      return Result.failure<LoginDto>(
        Error.failure(
          "Auth.UnexpectedError",
          err.message || "An unexpected error occurred during login",
        ),
      );
    }
  }
}
