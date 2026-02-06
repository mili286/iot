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
import { IoTEventRepository } from "../infrastructure/database/repositories/iot-event.repository";
import { RecordingRepository } from "../infrastructure/database/repositories/recording.repository";
import { SocketService } from "../infrastructure/socket/socket.service";
import { VideoService } from "../infrastructure/video/video.service";
import { IIoTEventRepository } from "../domain/repositories/iot-event.repository.interface";
import { IRecordingRepository } from "../domain/repositories/recording.repository.interface";
import { UserContext } from "../infrastructure/auth/user-context";
import { IUserContext } from "../application/ports/user-context.interface";
import { IAuthService } from "../application/ports/auth.service.interface";
import { IoTController } from "../presentation/http/controllers/iot.controller";
import { RecordingController } from "../presentation/http/controllers/recording.controller";

const container = new Container();

// Bind container to itself for the buses
container.bind(Container).toConstantValue(container);

// Repositories
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.AuthRepository).to(AuthRepository);
container
  .bind<IIoTEventRepository>(TYPES.IoTEventRepository)
  .to(IoTEventRepository);
container
  .bind<IRecordingRepository>(TYPES.RecordingRepository)
  .to(RecordingRepository);

// CQRS Buses - bind in request scope so they get the request-scoped container
container.bind<CommandBus>(TYPES.CommandBus).to(CommandBus).inRequestScope();
container.bind<QueryBus>(TYPES.QueryBus).to(QueryBus).inRequestScope();

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<IoTController>(TYPES.IoTController).to(IoTController);
container
  .bind<RecordingController>(TYPES.RecordingController)
  .to(RecordingController);

// Services
container
  .bind<IAuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<SocketService>(TYPES.SocketService)
  .to(SocketService)
  .inSingletonScope();
container
  .bind<VideoService>(TYPES.VideoService)
  .to(VideoService)
  .inSingletonScope();
container
  .bind<IUserContext>(TYPES.UserContext)
  .to(UserContext)
  .inRequestScope();

// Dynamic registration of Command and Query Handlers
const applicationPath = path.join(__dirname, "../application");
registerCqrsHandlers(container, applicationPath);

export { container };
