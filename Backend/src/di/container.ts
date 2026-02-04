import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../shared/types/common.types";
import { UserRepository } from "../infrastructure/database/repositories/user.repository";
import { CommandBus, QueryBus } from "../application/cqrs/bus";
import { registerCqrsHandlers } from "./cqrs-registry";
import * as path from "path";
import { UserController } from "../presentation/http/controllers/user.controller";
import { AuthService } from "../application/services/auth.service";
import { AuthController } from "../presentation/http/controllers/auth.controller";
import { UserContext } from "../infrastructure/auth/user-context";

const container = new Container();

// Bind container to itself for the buses
container.bind(Container).toConstantValue(container);

// Repositories
container.bind(TYPES.UserRepository).to(UserRepository);

// CQRS Buses
container.bind<CommandBus>(TYPES.CommandBus).to(CommandBus).inSingletonScope();
container.bind<QueryBus>(TYPES.QueryBus).to(QueryBus).inSingletonScope();

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

// Services
container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<UserContext>(TYPES.UserContext)
  .to(UserContext)
  .inSingletonScope();

// Dynamic registration of Command and Query Handlers
const applicationPath = path.join(__dirname, "../application");
registerCqrsHandlers(container, applicationPath);

export { container };
