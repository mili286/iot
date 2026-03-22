export interface SaveRecordingDto {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  duration: number;
  triggerType: string;
  recordingDate: Date;
  syncDate: Date;
  userId?: string;
}
