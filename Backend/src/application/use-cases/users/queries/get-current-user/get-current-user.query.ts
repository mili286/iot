import { IQuery } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { UserDto } from "./get-current-user.dto";
import { getCurrentUserSchema } from "./get-current-user.validation";

@Validate(getCurrentUserSchema)
export class GetCurrentUserQuery implements IQuery<UserDto> {
  constructor() {}
}
