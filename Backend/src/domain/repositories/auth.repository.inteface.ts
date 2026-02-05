export interface IAuthRepository {
  setRefreshToken(userId: string, refreshToken: string): Promise<void>;
  findRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
  deleteRefreshToken(userId: string, refreshToken: string): Promise<void>;
}
