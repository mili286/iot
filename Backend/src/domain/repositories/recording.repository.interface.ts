import { Recording } from "../entities/recordings/recording.entity";

export interface IRecordingRepository {
  create(recording: Partial<Recording>): Promise<Recording>;
  findAll(page?: number, limit?: number): Promise<Recording[]>;
  findById(id: string): Promise<Recording | null>;
  delete(id: string): Promise<boolean>;
}
