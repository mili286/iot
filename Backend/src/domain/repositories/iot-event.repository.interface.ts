import { IoTEvent } from "../entities/iot-events/iot-event.entity";

export interface IIoTEventRepository {
  create(event: Partial<IoTEvent>): Promise<IoTEvent>;
  findAll(): Promise<IoTEvent[]>;
}
