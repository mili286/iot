import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
import { PassThrough } from "stream";
import { injectable, inject } from "inversify";
import path from "path";
import fs from "fs";
import { TYPES } from "../../shared/types/common.types";
import { CommandBus } from "../../application/cqrs/bus";
import { SaveRecordingCommand } from "../../application/use-cases/iot/commands/save-recording/save-recording.command";

@injectable()
export class VideoService {
  private activeSessions: Map<
    string,
    {
      stream: PassThrough;
      command?: ffmpeg.FfmpegCommand;
      filePath: string;
      fileName: string;
    }
  > = new Map();

  constructor(@inject(TYPES.CommandBus) private commandBus: CommandBus) {}

  startRecording(sessionId: string): string {
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId)!.filePath;
    }

    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `recording-${Date.now()}.mp4`;
    const filePath = path.join(uploadDir, fileName);
    const inputStream = new PassThrough();

    this.activeSessions.set(sessionId, {
      stream: inputStream,
      filePath,
      fileName,
    });
    return filePath;
  }

  private startFfmpegProcess(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.command) {
      console.error("FFmpeg process already running or session not found");
      return;
    }

    const { stream: inputStream, filePath, fileName } = session;

    const command = ffmpeg(inputStream)
      .inputFormat("image2pipe")
      .inputOptions(["-vcodec", "mjpeg", "-r", "5"])
      .fps(5)
      .videoCodec("libx264")
      .outputOptions("-pix_fmt yuv420p")
      .on("start", (commandLine) => {})
      .on("stderr", (stderrLine) => {})
      .on("error", async (err) => {
        console.error(`Ffmpeg Error for session ${sessionId}: ${err.message}`);
        await this.handleRecordingEnd(sessionId, filePath, fileName);
      })
      .on("end", async () => {
        await this.handleRecordingEnd(sessionId, filePath, fileName);
      })
      .save(filePath);

    session.command = command;
  }

  private async handleRecordingEnd(
    sessionId: string,
    filePath: string,
    fileName: string,
  ) {
    if (!this.activeSessions.has(sessionId)) {
      return;
    }

    this.activeSessions.delete(sessionId);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);

      if (stats.size > 0) {
        try {
          const normalizedPath = filePath.replace(/\\/g, "/");
          const result = await this.commandBus.execute(
            new SaveRecordingCommand(
              fileName,
              normalizedPath,
              "video/mp4",
              stats.size,
            ),
          );
          if (result.isFailure) {
            console.error(`Failed to save recording to DB: ${result.error}`);
          } else {
          }
        } catch (error) {
          console.error(`Error executing SaveRecordingCommand: ${error}`);
        }
      } else {
        console.warn(`File ${fileName} is empty, deleting.`);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
    }
  }

  addFrame(sessionId: string, buffer: Buffer): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.stream.write(buffer);
      if (!session.command) {
        this.startFfmpegProcess(sessionId);
      }
    } else {
      console.warn(
        `Session ${sessionId} not found in active sessions during addFrame`,
      );
    }
  }

  stopRecording(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.stream.end();
      if (!session.command) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  isRecording(sessionId: string): boolean {
    return this.activeSessions.has(sessionId);
  }
}
