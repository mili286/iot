import { User } from "../entities/users/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<void>;
  register(user: Partial<User>, password: string): Promise<User>;
}
