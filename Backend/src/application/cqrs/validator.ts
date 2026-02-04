import { ObjectSchema } from "joi";
import { Result } from "../../shared/result";
import { ValidationError } from "../../shared/validation.error";
import { Error } from "../../shared/error";

export class Validator {
  static validate<T>(schema: ObjectSchema, data: T): Result<T> {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) =>
        Error.problem(
          detail.path.join("."),
          detail.message.replace(/['"]/g, ""),
        ),
      );
      return Result.failure(new ValidationError(errors));
    }

    return Result.success(value);
  }
}
