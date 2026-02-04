import { AsyncLocalStorage } from "async_hooks";
import { injectable } from "inversify";
import { IUserContext } from "../../application/ports/user-context.interface";

export const userContextStorage = new AsyncLocalStorage<{ userId: string }>();

@injectable()
export class UserContext implements IUserContext {
  get userId(): string | null {
    const store = userContextStorage.getStore();
    return store ? store.userId : null;
  }
}
