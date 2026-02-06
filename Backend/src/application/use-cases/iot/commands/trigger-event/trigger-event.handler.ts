import { inject, injectable } from "inversify";
import { CommandHandler } from "../../../../cqrs/decorators";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { TriggerEventCommand } from "./trigger-event.command";
import { Result } from "../../../../../shared/result";
import { TYPES } from "../../../../../shared/types/common.types";
import { IIoTEventRepository } from "../../../../../domain/repositories/iot-event.repository.interface";
import { SocketService } from "../../../../../infrastructure/socket/socket.service";
import { TriggerEventDto } from "./trigger-event.dto";

@injectable()
@CommandHandler(TriggerEventCommand)
export class TriggerEventHandler implements ICommandHandler<
  TriggerEventCommand,
  TriggerEventDto
> {
  constructor(
    @inject(TYPES.IoTEventRepository)
    private eventRepository: IIoTEventRepository,
    @inject(TYPES.SocketService) private socketService: SocketService,
  ) {}

  async handle(command: TriggerEventCommand): Promise<Result<TriggerEventDto>> {
    const event = await this.eventRepository.create({
      type: command.type,
      timestamp: command.timestamp,
    });

    this.socketService.emitNotification({
      type: event.type,
      timestamp: event.timestamp,
      message: `${event.type === "motion" ? "Motion Detected!" : "Button Pressed!"}`,
    });

    this.socketService.startRecordingAll(30000);

    return Result.success({
      id: event._id.toString(),
      type: event.type,
      timestamp: event.timestamp,
    });
  }
}
