import { injectable } from "inversify";
import { IRecordingRepository } from "../../../domain/repositories/recording.repository.interface";
import recordingEntity, { Recording } from "../../../domain/entities/recordings/recording.entity";

@injectable()
export class RecordingRepository implements IRecordingRepository {
  async create(recording: Partial<Recording>): Promise<Recording> {
    return await recordingEntity.create(recording);
  }

  async findAll(): Promise<Recording[]> {
    return await recordingEntity.find().sort({ timestamp: -1 });
  }

  async findById(id: string): Promise<Recording | null> {
    return await recordingEntity.findById(id);
  }
}
