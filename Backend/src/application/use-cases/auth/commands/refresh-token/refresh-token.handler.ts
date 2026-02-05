import { injectable, inject } from "inversify";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { RefreshTokenCommand } from "./refresh-token.command";
import { CommandHandler } from "../../../../cqrs/decorators";
import { TYPES } from "../../../../../shared/types/common.types";
import { Result } from "../../../../../shared/result";
import { Error } from "../../../../../shared/error";
import { RefreshTokenDto } from "./refresh-token.dto";
import { IAuthService } from "../../../../ports/auth.service.interface";
import { IUserRepository } from "../../../../../domain/repositories/user.repository.interface";

@injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  RefreshTokenDto
> {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
  ) {}

  async handle(command: RefreshTokenCommand): Promise<Result<RefreshTokenDto>> {
    const { authToken, refreshToken } = command;

    // 1. Check for validity of auth token (get user id even if expired)
    const userId = this.authService.getUserIdFromToken(authToken);
    if (!userId) {
      return Result.failure<RefreshTokenDto>(
        Error.unauthorized("Auth.InvalidAuthToken", "Invalid auth token"),
      );
    }

    // 2. Find refresh token document by user id and refresh token
    const isValid = await this.authService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid) {
      return Result.failure<RefreshTokenDto>(
        Error.notFound("Auth.RefreshTokenNotFound", "Refresh token not found"),
      );
    }

    // 3. Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Result.failure<RefreshTokenDto>(
        Error.notFound("Auth.UserNotFound", "User not found"),
      );
    }

    // 4. Delete old refresh token
    await this.authService.deleteRefreshToken(userId, refreshToken);

    // 5. Generate new tokens
    const newAuthToken = this.authService.generateAccessToken(user);
    const newRefreshToken = this.authService.generateRefreshToken();

    // 6. Insert newly created one
    await this.authService.setRefreshToken(userId, newRefreshToken);

    // 7. Return to response
    return Result.success<RefreshTokenDto>({
      authToken: newAuthToken,
      refreshToken: newRefreshToken,
    });
  }
}
