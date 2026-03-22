import { Recording } from "../entities/recordings/recording.entity";

export interface IRecordingRepository {
  create(recording: Partial<Recording>): Promise<Recording>;
  findAll(
    page?: number,
    limit?: number,
    searchTerm?: string,
    triggerType?: string,
    startDate?: Date,
    endDate?: Date,
    sortBy?: string,
  ): Promise<Recording[]>;
  findById(id: string): Promise<Recording | null>;
  findLatest(): Promise<Recording | null>;
  update(id: string, recording: Partial<Recording>): Promise<Recording | null>;
  delete(id: string): Promise<boolean>;
}
