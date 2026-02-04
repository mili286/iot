import { ErrorTypes } from "./constants/error-types.enum";

export class Error {
  static readonly None = new Error("", "", ErrorTypes.Failure);
  static readonly NullValue = new Error(
    "General.Null",
    "Null value was provided",
    ErrorTypes.Validation,
  );

  constructor(code: string, description: string, type: ErrorTypes) {
    this.code = code;
    this.description = description;
    this.type = type;
  }

  code: string;
  description: string;
  type: ErrorTypes;

  static failure(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.Failure);
  }

  static validation(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.Validation);
  }

  static problem(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.Problem);
  }

  static notFound(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.NotFound);
  }

  static conflict(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.Conflict);
  }

  static unauthorized(code: string, description: string): Error {
    return new Error(code, description, ErrorTypes.Unauthorized);
  }
}
