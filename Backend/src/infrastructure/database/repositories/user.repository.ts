import { injectable } from "inversify";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import UserModel, { User } from "../../../domain/entities/users/user.entity";

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    const entity = {
      firstName: user.firstName,
      lastName: user.lastName,
    } as User;
    await UserModel.create(entity);
    return;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);

    return user;
  }

  async register(user: Partial<User>, password: string): Promise<User> {
    const newUser = new UserModel(user);
    return await UserModel.register(newUser, password);
  }
}
