import { Request } from "express";

interface LoginRequest extends Request<
  any,
  any,
  {
    username: string;
    password: string;
  }
> {}

interface RegisterRequest extends Request<
  any,
  any,
  {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
> {}

interface RefreshTokenRequest extends Request<
  any,
  any,
  {
    authToken: string;
    refreshToken: string;
  }
> {}

export { LoginRequest, RegisterRequest, RefreshTokenRequest };
