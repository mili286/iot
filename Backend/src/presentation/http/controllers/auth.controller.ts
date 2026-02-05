import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { CommandBus } from "../../../application/cqrs/bus";
import { createResult } from "../infrastructure/custom-results";
import { LoginCommand } from "../../../application/use-cases/auth/commands/login/login.command";
import { RegisterUserCommand } from "../../../application/use-cases/auth/commands/register/register-user.command";
import { RefreshTokenCommand } from "../../../application/use-cases/auth/commands/refresh-token/refresh-token.command";
import { RefreshTokenRequest } from "../requests/auth.requests";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.CommandBus) private commandBus: CommandBus) {}

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginCommand(req.body.username, req.body.password),
    );
    createResult(res, result);
  }

  async register(req: Request, res: Response): Promise<void> {
    const result = await this.commandBus.execute(
      new RegisterUserCommand(
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.firstName,
        req.body.lastName,
      ),
    );
    createResult(res, result);
  }

  async refreshToken(req: RefreshTokenRequest, res: Response): Promise<void> {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(req.body.authToken, req.body.refreshToken),
    );
    createResult(res, result);
  }
}
