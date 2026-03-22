import { injectable } from "inversify";
import { IRecordingRepository } from "../../../domain/repositories/recording.repository.interface";
import recordingEntity, { Recording } from "../../../domain/entities/recordings/recording.entity";

@injectable()
export class RecordingRepository implements IRecordingRepository {
  async create(recording: Partial<Recording>): Promise<Recording> {
    return await recordingEntity.create(recording);
  }

  async findAll(
    page?: number,
    limit?: number,
    searchTerm?: string,
    triggerType?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
  ): Promise<Recording[]> {
    const filter: any = {};

    if (searchTerm) {
      filter.filename = { $regex: searchTerm, $options: "i" };
    }

    if (triggerType && triggerType !== "all") {
      filter.triggerType = triggerType;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    let sortOption: any = { timestamp: -1 };
    if (sortBy === "oldest") {
      sortOption = { timestamp: 1 };
    } else if (sortBy === "duration") {
      sortOption = { duration: -1 };
    }

    if (page && limit) {
      return await recordingEntity
        .find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
    }
    return await recordingEntity.find(filter).sort(sortOption);
  }

  async findById(id: string): Promise<Recording | null> {
    return await recordingEntity.findById(id);
  }

  async findLatest(): Promise<Recording | null> {
    return await recordingEntity.findOne().sort({ recordingDate: -1 });
  }

  async update(
    id: string,
    recording: Partial<Recording>,
  ): Promise<Recording | null> {
    return await recordingEntity.findByIdAndUpdate(id, recording, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await recordingEntity.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
