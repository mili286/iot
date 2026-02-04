import { Request, Response, NextFunction } from "express";
import { userContextStorage } from "../../../infrastructure/auth/user-context";

export const userContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as any;

  if (user && user.id) {
    userContextStorage.run({ userId: user.id }, () => {
      next();
    });
  } else {
    next();
  }
};
