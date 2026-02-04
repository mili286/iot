import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import { User } from "../../domain/entities/users/user.entity";

@injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET || "default_secret";

  generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: "1d",
    });
  }
}
