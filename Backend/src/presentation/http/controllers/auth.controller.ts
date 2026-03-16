import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { CommandBus } from "../../../application/cqrs/bus";
import { createResult } from "../infrastructure/custom-results";
import { LoginCommand } from "../../../application/use-cases/auth/commands/login/login.command";
import { RegisterUserCommand } from "../../../application/use-cases/auth/commands/register/register-user.command";
import { RefreshTokenCommand } from "../../../application/use-cases/auth/commands/refresh-token/refresh-token.command";
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from "../requests/auth.requests";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.CommandBus) private commandBus: CommandBus) {}

  async login(req: LoginRequest, res: Response): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginCommand(req.body.email, req.body.password),
    );
    createResult(res, result);
  }

  async register(req: RegisterRequest, res: Response): Promise<void> {
    const username = req.body.username || req.body.email;
    const result = await this.commandBus.execute(
      new RegisterUserCommand(
        username,
        req.body.email,
        req.body.password,
        req.body.fullName,
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
