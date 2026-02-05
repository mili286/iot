import { Container } from "inversify";
import { TYPES } from "../shared/types/common.types";
import { UserRepository } from "../infrastructure/database/repositories/user.repository";
import { CommandBus, QueryBus } from "../application/cqrs/bus";
import { registerCqrsHandlers } from "./cqrs-registry";
import * as path from "path";
import { UserController } from "../presentation/http/controllers/user.controller";
import { AuthService } from "../infrastructure/auth/auth.service";
import { AuthController } from "../presentation/http/controllers/auth.controller";
import { AuthRepository } from "../infrastructure/database/repositories/auth.repository";
import { UserContext } from "../infrastructure/auth/user-context";
import { IUserContext } from "../application/ports/user-context.interface";
import { IAuthService } from "../application/ports/auth.service.interface";

const container = new Container();

// Bind container to itself for the buses
container.bind(Container).toConstantValue(container);

// Repositories
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.AuthRepository).to(AuthRepository);

// CQRS Buses - bind in request scope so they get the request-scoped container
container.bind<CommandBus>(TYPES.CommandBus).to(CommandBus).inRequestScope();
container.bind<QueryBus>(TYPES.QueryBus).to(QueryBus).inRequestScope();

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

// Services
container
  .bind<IAuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<IUserContext>(TYPES.UserContext)
  .to(UserContext)
  .inRequestScope();

// Dynamic registration of Command and Query Handlers
const applicationPath = path.join(__dirname, "../application");
registerCqrsHandlers(container, applicationPath);

export { container };
