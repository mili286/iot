export interface RecordingDetailDto {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  duration: number;
  timestamp: Date;
  triggerType: string;
  recordingDate: Date;
  syncDate: Date;
  userId?: string;
  userName?: string;
}
