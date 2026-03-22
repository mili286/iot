import { inject, injectable } from "inversify";
import { CommandHandler } from "../../../../cqrs/decorators";
import { ICommandHandler } from "../../../../cqrs/interfaces";
import { ProcessMjpegUploadCommand } from "./process-mjpeg-upload.command";
import { Result } from "../../../../../shared/result";
import { Error } from "../../../../../shared/error";
import { TYPES } from "../../../../../shared/types/common.types";
import { IRecordingRepository } from "../../../../../domain/repositories/recording.repository.interface";
import { ISystemParametersRepository } from "../../../../../domain/repositories/system-parameters.repository.interface";
import { MjpegProcessorService } from "../../../../../infrastructure/video/mjpeg-processor.service";
import { SaveRecordingDto } from "../save-recording/save-recording.dto";
import fs from "fs";
import path from "path";

@injectable()
@CommandHandler(ProcessMjpegUploadCommand)
export class ProcessMjpegUploadHandler implements ICommandHandler<
  ProcessMjpegUploadCommand,
  SaveRecordingDto
> {
  constructor(
    @inject(TYPES.RecordingRepository)
    private recordingRepository: IRecordingRepository,
    @inject(TYPES.SystemParametersRepository)
    private systemParametersRepository: ISystemParametersRepository,
    @inject(TYPES.MjpegProcessorService)
    private mjpegProcessorService: MjpegProcessorService,
  ) {}

  async handle(
    command: ProcessMjpegUploadCommand,
  ): Promise<Result<SaveRecordingDto>> {
    // Check if the uploaded file is empty
    if (!fs.existsSync(command.path) || fs.statSync(command.path).size === 0) {
      console.warn(
        `Uploaded MJPEG file is empty or does not exist: ${command.path}. Skipping processing.`,
      );
      if (fs.existsSync(command.path)) {
        fs.unlinkSync(command.path);
      }
      // Return a "success" to avoid ESP32 retrying, but with dummy ID
      return Result.success({
        id: "skipped",
        filename: command.filename,
        path: command.path,
        mimetype: command.mimetype,
        size: 0,
        duration: 0,
        triggerType: command.triggerType,
        recordingDate: command.recordingDate,
        syncDate: command.syncDate,
        userId: command.userId,
      });
    }

    const latestRecording = await this.recordingRepository.findLatest();

    let mergeWithLatest = false;
    if (latestRecording && latestRecording.mimetype === "video/mp4") {
      const latestEndTime =
        latestRecording.recordingDate.getTime() +
        latestRecording.duration * 1000;
      const currentStartTime = command.recordingDate.getTime();
      const diffSeconds = (currentStartTime - latestEndTime) / 1000;

      // If the difference is less than 1 minute (60 seconds), merge
      if (diffSeconds >= 0 && diffSeconds <= 60) {
        mergeWithLatest = true;
      }
    }

    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let finalFilePath: string;
    let finalFileName: string;
    let resultDuration: number;
    let resultSize: number;

    try {
      if (mergeWithLatest && latestRecording) {
        finalFilePath = latestRecording.path;
        finalFileName = latestRecording.filename;

        const { duration, size } =
          await this.mjpegProcessorService.processMjpeg(
            command.path,
            finalFilePath,
            finalFilePath,
            command.duration || 5,
            latestRecording.duration,
          );

        resultDuration = duration;
        resultSize = size;

        // Update database
        await this.recordingRepository.update(latestRecording._id.toString(), {
          duration: resultDuration,
          size: resultSize,
          syncDate: command.syncDate,
        });

        // Update system parameters
        const addedDuration = resultDuration - latestRecording.duration;
        await this.systemParametersRepository.addRecordingsDuration(
          addedDuration,
        );

        // Delete the uploaded MJPEG file after processing
        if (fs.existsSync(command.path)) {
          fs.unlinkSync(command.path);
        }

        return Result.success({
          id: latestRecording._id.toString(),
          filename: finalFileName,
          path: finalFilePath,
          mimetype: "video/mp4",
          size: resultSize,
          duration: resultDuration,
          triggerType: latestRecording.triggerType,
          recordingDate: latestRecording.recordingDate,
          syncDate: command.syncDate,
          userId: latestRecording.userId,
        });
      } else {
        // Create new MP4
        finalFileName = `recording-${command.recordingDate.getTime()}.mp4`;
        finalFilePath = path.join(uploadDir, finalFileName).replace(/\\/g, "/");

        const { duration, size } =
          await this.mjpegProcessorService.processMjpeg(
            command.path,
            finalFilePath,
            undefined,
            command.duration || 5,
          );

        resultDuration = duration;
        resultSize = size;

        const recording = await this.recordingRepository.create({
          filename: finalFileName,
          path: finalFilePath,
          mimetype: "video/mp4",
          size: resultSize,
          duration: resultDuration,
          triggerType: command.triggerType,
          recordingDate: command.recordingDate,
          syncDate: command.syncDate,
          userId: command.userId,
        });

        await this.systemParametersRepository.incrementRecordingsCount();
        await this.systemParametersRepository.addRecordingsDuration(
          resultDuration,
        );

        // Delete the uploaded MJPEG file after processing
        if (fs.existsSync(command.path)) {
          fs.unlinkSync(command.path);
        }

        return Result.success({
          id: recording._id.toString(),
          filename: recording.filename,
          path: recording.path,
          mimetype: recording.mimetype,
          size: recording.size,
          duration: recording.duration,
          triggerType: recording.triggerType,
          recordingDate: recording.recordingDate,
          syncDate: recording.syncDate,
          userId: recording.userId,
        });
      }
    } catch (error: any) {
      console.error("Error processing MJPEG upload:", error);
      return Result.failure(
        Error.problem(
          "IoT.ProcessMjpegUploadError",
          error.message || "An error occurred while processing the MJPEG file",
        ),
      );
    }
  }
}
