import { ICommand } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { refreshTokenSchema } from "./refresh-token.validation";
import { RefreshTokenDto } from "./refresh-token.dto";

@Validate(refreshTokenSchema)
export class RefreshTokenCommand implements ICommand<RefreshTokenDto> {
  constructor(
    public readonly authToken: string,
    public readonly refreshToken: string,
  ) {}
}
