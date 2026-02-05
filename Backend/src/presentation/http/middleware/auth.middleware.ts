import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { userContextStorage } from "../../../infrastructure/auth/user-context";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user;
      userContextStorage.run({ userId: user._id }, () => {
        next();
      });
    },
  )(req, res, next);
};
