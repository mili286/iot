import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/types/common.types";
import { QueryBus } from "../../../application/cqrs/bus";
import { GetRecordingsQuery } from "../../../application/use-cases/iot/queries/get-recordings/get-recordings.query";
import { GetRecordingByIdQuery } from "../../../application/use-cases/iot/queries/get-recording-by-id/get-recording-by-id.query";
import { createResult } from "../infrastructure/custom-results";
import path from "path";
import fs from "fs";
import { RecordingDto } from "../../../application/use-cases/iot/queries/get-recordings/get-recordings.dto";
import { RecordingDetailDto } from "../../../application/use-cases/iot/queries/get-recording-by-id/get-recording-by-id.dto";
import { GetRecordingsRequest, StreamRecordingRequest } from "../requests/recording.requests";

@injectable()
export class RecordingController {
  constructor(@inject(TYPES.QueryBus) private queryBus: QueryBus) {}

  async getRecordings(req: GetRecordingsRequest, res: Response): Promise<void> {
    const result = await this.queryBus.execute<RecordingDto[]>(
      new GetRecordingsQuery(),
    );
    createResult(res, result);
  }

  async streamRecording(req: StreamRecordingRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.queryBus.execute<RecordingDetailDto | null>(
      new GetRecordingByIdQuery(id.toString()),
    );

    if (result.isFailure || !result.value) {
      createResult(res, result);
      return;
    }

    const recording = result.value;
    const filePath = path.resolve(recording.path);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on disk" });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": recording.mimetype,
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": recording.mimetype,
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  }
}
