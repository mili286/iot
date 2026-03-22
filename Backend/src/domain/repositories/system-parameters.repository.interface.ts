import { SystemParameters } from "../entities/system/system-parameters.entity";

export interface ISystemParametersRepository {
  getParameters(): Promise<SystemParameters>;
  updateRecordingsCount(count: number): Promise<void>;
  updateTotalRecordingsDuration(duration: number): Promise<void>;
  updateMotionEventsCount(count: number): Promise<void>;
  updateStatus(status: "Active" | "Inactive"): Promise<void>;
  incrementRecordingsCount(): Promise<void>;
  decrementRecordingsCount(): Promise<void>;
  addRecordingsDuration(duration: number): Promise<void>;
  subtractRecordingsDuration(duration: number): Promise<void>;
  incrementMotionEventsCount(): Promise<void>;
  initializeSystemParameters(): Promise<void>;
}
