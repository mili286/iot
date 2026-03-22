import { injectable, inject } from "inversify";
import { ISystemParametersRepository } from "../../../../domain/repositories/system-parameters.repository.interface";
import SystemParametersModel, {
  SystemParameters,
} from "../../../../domain/entities/system/system-parameters.entity";
import RecordingModel from "../../../../domain/entities/recordings/recording.entity";
import IoTEventModel from "../../../../domain/entities/iot-events/iot-event.entity";

@injectable()
export class SystemParametersRepository implements ISystemParametersRepository {
  private async getDocument(): Promise<SystemParameters> {
    let doc = await SystemParametersModel.findOne();
    if (!doc) {
      const recordingsCount = await RecordingModel.countDocuments();
      const motionEventsCount = await IoTEventModel.countDocuments({ type: "motion" });
      
      const recordings = await RecordingModel.find({}, { duration: 1 });
      const totalRecordingsDuration = recordings.reduce((acc, curr) => acc + (curr.duration || 0), 0);

      doc = await SystemParametersModel.create({
        recordingsCount,
        totalRecordingsDuration,
        motionEventsCount,
        status: "Inactive",
        resolution: "1280x720",
        lastUpdated: new Date(),
      });
    }
    return doc;
  }

  async initializeSystemParameters(): Promise<void> {
    await this.getDocument();
  }

  async getParameters(): Promise<SystemParameters> {
    return await this.getDocument();
  }

  async updateRecordingsCount(count: number): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { recordingsCount: count, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async updateTotalRecordingsDuration(duration: number): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { totalRecordingsDuration: duration, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async updateMotionEventsCount(count: number): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { motionEventsCount: count, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async updateStatus(status: "Active" | "Inactive"): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { status, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async incrementRecordingsCount(): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { $inc: { recordingsCount: 1 }, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async decrementRecordingsCount(): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { $inc: { recordingsCount: -1 }, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async addRecordingsDuration(duration: number): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { $inc: { totalRecordingsDuration: duration }, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async subtractRecordingsDuration(duration: number): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { $inc: { totalRecordingsDuration: -duration }, lastUpdated: new Date() },
      { upsert: true },
    );
  }

  async incrementMotionEventsCount(): Promise<void> {
    await SystemParametersModel.updateOne(
      {},
      { $inc: { motionEventsCount: 1 }, lastUpdated: new Date() },
      { upsert: true },
    );
  }
}
