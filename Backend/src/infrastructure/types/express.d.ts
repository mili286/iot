import { Container } from "inversify";

declare global {
  namespace Express {
    interface User {
      _id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
    }

    interface Request {
      container: Container;
      user?: User;
    }
  }
}
export {};
