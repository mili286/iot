import { ErrorTypes } from "./constants/error-types.enum";
import { Error } from "./error";
import { Result } from "./result";

export class ValidationError extends Error {
  constructor(errors: Error[]) {
    super(
      "Validation.General",
      "One or more validation errors occurred.",
      ErrorTypes.Validation,
    );
    this.errors = errors;
  }

  errors: Error[];

  static fromResults(results: Result[]): ValidationError {
    const errors = results
      .filter((result) => result.isFailure)
      .map((result) => result.error);
    return new ValidationError(errors);
  }
}
