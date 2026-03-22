import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { CommandBus } from "../../../application/cqrs/bus";
import { TriggerEventCommand } from "../../../application/use-cases/iot/commands/trigger-event/trigger-event.command";
import { SaveRecordingCommand } from "../../../application/use-cases/iot/commands/save-recording/save-recording.command";
import { ProcessMjpegUploadCommand } from "../../../application/use-cases/iot/commands/process-mjpeg-upload/process-mjpeg-upload.command";
import { createResult } from "../infrastructure/custom-results";
import { Result } from "../../../shared/result";
import { Error } from "../../../shared/error";
import {
  TriggerEventRequest,
  UploadStreamRequest,
} from "../requests/iot.requests";

import path from "path";

@injectable()
export class IoTController {
  constructor(@inject(TYPES.CommandBus) private commandBus: CommandBus) {}

  async triggerEvent(req: TriggerEventRequest, res: Response): Promise<void> {
    const { type, timestamp } = req.body;
    const result = await this.commandBus.execute(
      new TriggerEventCommand(
        type,
        timestamp ? new Date(timestamp) : undefined,
      ),
    );
    createResult(res, result);
  }

  async uploadStream(req: UploadStreamRequest, res: Response): Promise<void> {
    if (!req.file) {
      const result = Result.failure(
        Error.problem("IoT.UploadStream", "No file uploaded"),
      );
      createResult(res, result);
      return;
    }

    const filename =
      req.file.filename || req.file.originalname || `upload-${Date.now()}`;
    const filePath = req.file.path;
    const mimetype = req.file.mimetype || "application/octet-stream";
    const size = req.file.size || 0;
    const duration = req.body.duration ? parseInt(req.body.duration, 10) : 0;
    const triggerType = req.body.triggerType || "unknown";

    // Extract recording date from filename (Unix timestamp)
    const originalName = req.file.originalname || filename;
    const nameOnly = path.parse(originalName).name;
    let recordingDate = new Date();
    
    // Check if filename is a numeric string (Unix timestamp in seconds)
    if (/^\d+$/.test(nameOnly)) {
      const timestamp = parseInt(nameOnly, 10);
      // If it looks like a timestamp (between year 2000 and 2100)
      if (timestamp > 946684800 && timestamp < 4102444800) {
        recordingDate = new Date(timestamp * 1000);
      }
    }

    const result = await this.commandBus.execute(
      new ProcessMjpegUploadCommand(
        filename,
        filePath,
        mimetype,
        size,
        duration,
        triggerType,
        recordingDate,
        new Date(),
        (req as any).user?.id,
      ),
    );
    createResult(res, result);
  }
}
