import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { CommandBus } from "../../../application/cqrs/bus";
import { TriggerEventCommand } from "../../../application/use-cases/iot/commands/trigger-event/trigger-event.command";
import { SaveRecordingCommand } from "../../../application/use-cases/iot/commands/save-recording/save-recording.command";
import { createResult } from "../infrastructure/custom-results";
import { Result } from "../../../shared/result";
import { Error } from "../../../shared/error";
import { TriggerEventRequest, UploadStreamRequest } from "../requests/iot.requests";

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
    const path = req.file.path;
    const mimetype = req.file.mimetype || "application/octet-stream";
    const size = req.file.size || 0;

    const result = await this.commandBus.execute(
      new SaveRecordingCommand(filename, path, mimetype, size),
    );
    createResult(res, result);
  }
}
