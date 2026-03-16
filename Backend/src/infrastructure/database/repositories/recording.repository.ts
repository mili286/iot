import { injectable } from "inversify";
import { IRecordingRepository } from "../../../domain/repositories/recording.repository.interface";
import recordingEntity, { Recording } from "../../../domain/entities/recordings/recording.entity";

@injectable()
export class RecordingRepository implements IRecordingRepository {
  async create(recording: Partial<Recording>): Promise<Recording> {
    return await recordingEntity.create(recording);
  }

  async findAll(page?: number, limit?: number): Promise<Recording[]> {
    if (page && limit) {
      return await recordingEntity
        .find()
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }
    return await recordingEntity.find().sort({ timestamp: -1 });
  }

  async findById(id: string): Promise<Recording | null> {
    return await recordingEntity.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await recordingEntity.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
