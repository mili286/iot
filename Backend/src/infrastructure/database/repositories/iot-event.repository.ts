import { injectable } from "inversify";
import { IIoTEventRepository } from "../../../domain/repositories/iot-event.repository.interface";
import iotEventEntity, { IoTEvent } from "../../../domain/entities/iot-events/iot-event.entity";

@injectable()
export class IoTEventRepository implements IIoTEventRepository {
  async create(event: Partial<IoTEvent>): Promise<IoTEvent> {
    return await iotEventEntity.create(event);
  }

  async findAll(): Promise<IoTEvent[]> {
    return await iotEventEntity.find().sort({ timestamp: -1 });
  }
}
