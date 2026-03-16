import { IQuery } from "../../../cqrs/interfaces";

export class GetUserByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
