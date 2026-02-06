import { Request } from "express";

interface CreateUserRequest
  extends Request<
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

interface GetCurrentUserRequest extends Request {}

export { CreateUserRequest, GetCurrentUserRequest };
