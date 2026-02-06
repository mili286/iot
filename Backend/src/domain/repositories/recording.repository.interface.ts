import { Recording } from "../entities/recordings/recording.entity";

export interface IRecordingRepository {
  create(recording: Partial<Recording>): Promise<Recording>;
  findAll(): Promise<Recording[]>;
  findById(id: string): Promise<Recording | null>;
}
