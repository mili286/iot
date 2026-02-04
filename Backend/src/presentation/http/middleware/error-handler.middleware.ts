import { Request, Response, NextFunction } from "express";
import { Exception } from "../../../shared/exception";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof Exception) {
    return res.status(err.statusCode).json({
      title: "Exception",
      detail: err.message,
      type: "https://tools.ietf.org/html/rfc7231#section-6.6.1",
    });
  }

  // Handle generic errors
  return res.status(500).json({
    title: "Server Error",
    detail: err.message || "An unexpected error occurred",
    type: "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  });
};
