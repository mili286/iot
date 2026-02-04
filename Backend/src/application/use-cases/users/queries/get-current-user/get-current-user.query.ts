import { IQuery } from "../../../cqrs/interfaces";
import { User } from "../../../../domain/entities/users/user.entity";

export class GetCurrentUserQuery implements IQuery<User> {
  constructor() {}
}
