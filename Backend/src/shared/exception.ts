export class Exception extends Error {
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
  statusCode: number;
}
