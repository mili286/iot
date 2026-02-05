import { injectable } from "inversify";
import { IAuthRepository } from "../../../domain/repositories/auth.repository.inteface";
import refreshTokenEntity from "../../../domain/entities/refresh-tokens/refresh-token.entity";

@injectable()
export class AuthRepository implements IAuthRepository {
  constructor() {}

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await refreshTokenEntity.create({
      userId: userId,
      refreshToken: refreshToken,
    });
  }

  async findRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const token = await refreshTokenEntity.findOne({
      userId: userId,
      refreshToken: refreshToken,
    });
    return !!token;
  }

  async deleteRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await refreshTokenEntity.deleteOne({
      userId: userId,
      refreshToken: refreshToken,
    });
  }
}
