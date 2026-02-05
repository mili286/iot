import { Request } from "express";

interface RefreshTokenRequest
  extends Request<
    any,
    any,
    {
      authToken: string;
      refreshToken: string;
    }
  > {}

export { RefreshTokenRequest };
