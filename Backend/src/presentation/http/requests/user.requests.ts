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

interface GetUsersRequest extends Request {}

interface GetUserByIdRequest
  extends Request<
    {
      id: string;
    },
    any,
    any
  > {}

export { CreateUserRequest, GetCurrentUserRequest, GetUsersRequest, GetUserByIdRequest };
