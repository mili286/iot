import { Error } from "./error";
import { Exception } from "./exception";

export class Result<TValue = void> {
  constructor(isSuccess: boolean, error: Error, value?: TValue) {
    if (isSuccess && error !== Error.None)
      throw new Exception(500, "Ivalid error");

    this.isSuccess = isSuccess;
    this.error = error;
    this._value = value;
  }

  private _value?: TValue;

  isSuccess: boolean;
  error: Error;
  get value(): TValue {
    if (!this.isSuccess)
      throw new Exception(500, "Cannot access value of failed result");
    return this._value!;
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  static success<TValue = void>(value?: TValue): Result<TValue> {
    return new Result<TValue>(true, Error.None, value);
  }

  static failure<TValue = void>(error: Error): Result<TValue> {
    return new Result<TValue>(false, error);
  }

  static validationFailure(error: Error): Result {
    return new Result(false, error);
  }
}
