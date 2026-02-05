import { User } from "../../domain/entities/users/user.entity";

export interface IAuthService {
  generateAccessToken(user: User): string;
  generateRefreshToken(): string;
  hashToken(token: string): string;
  setRefreshToken(userId: string, refreshToken: string): Promise<void>;
  verifyToken(token: string): any;
  getUserIdFromToken(token: string): string | null;
  validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
  deleteRefreshToken(userId: string, refreshToken: string): Promise<void>;
}
