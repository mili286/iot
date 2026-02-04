import { Response } from "express";
import { Result } from "../../../shared/result";
import { Error } from "../../../shared/error";
import { ErrorTypes } from "../../../shared/constants/error-types.enum";
import { ValidationError } from "../../../shared/validation.error";

export interface CustomResult {
  title: string;
  detail: string;
  type: string;
  errors?: Error[];
}

export function createResult<T = void>(
  respone: Response,
  result: Result<T>,
): Response {
  return result.isSuccess ? success(respone, result) : problem(respone, result);
}

function success<T = void>(respone: Response, result: Result<T>): Response {
  return result.value
    ? respone.status(200).json(result.value)
    : respone.status(204).json();
}

function problem<T = void>(respone: Response, result: Result<T>): Response {
  return respone
    .status(getStatus(result.error))
    .json(createCustomResult(result.error));
}

function getStatus(error: Error): number {
  switch (error.type) {
    case ErrorTypes.Validation:
      return 400;
    case ErrorTypes.NotFound:
      return 404;
    case ErrorTypes.Unauthorized:
      return 401;
    case ErrorTypes.Failure:
      return 400;
    case ErrorTypes.Conflict:
      return 409;
    default:
      return 500;
  }
}

function createCustomResult(error: Error): CustomResult {
  switch (error.type) {
    case ErrorTypes.Validation:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
        errors: error instanceof ValidationError ? error.errors : undefined,
      };
    case ErrorTypes.NotFound:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.4",
      };
    case ErrorTypes.Unauthorized:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7235#section-3.1",
      };
    case ErrorTypes.Failure:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      };
    case ErrorTypes.Conflict:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.8",
      };
    case ErrorTypes.Problem:
      return {
        title: error.code,
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
      };
    default:
      return {
        title: "Server failure",
        detail: error.description,
        type: "https://tools.ietf.org/html/rfc7231#section-6.6.1",
      };
  }
}
