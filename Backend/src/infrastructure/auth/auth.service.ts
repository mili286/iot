import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import { User } from "../../domain/entities/users/user.entity";
import crypto from "crypto";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/common.types";
import { IAuthService } from "../../application/ports/auth.service.interface";
import { IAuthRepository } from "../../domain/repositories/auth.repository.inteface";

@injectable()
export class AuthService implements IAuthService {
  private readonly secret = process.env.JWT_SECRET || "default_secret";

  constructor(
    @inject(TYPES.AuthRepository) private authRepository: IAuthRepository,
  ) {}

  generateAccessToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: "15min",
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString("base64url");
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    refreshToken = this.hashToken(refreshToken);
    await this.authRepository.setRefreshToken(userId, refreshToken);
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret, { ignoreExpiration: true });
    } catch (error) {
      return null;
    }
  }

  getUserIdFromToken(token: string): string | null {
    const decoded = this.verifyToken(token);
    return decoded ? decoded.id : null;
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const hashedToken = this.hashToken(refreshToken);
    return await this.authRepository.findRefreshToken(userId, hashedToken);
  }

  async deleteRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    await this.authRepository.deleteRefreshToken(userId, hashedToken);
  }
}
