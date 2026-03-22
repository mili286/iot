import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { injectable, inject } from "inversify";
import { TYPES } from "../../shared/types/common.types";
import { VideoService } from "../video/video.service";
import { ISystemParametersRepository } from "../../domain/repositories/system-parameters.repository.interface";

@injectable()
export class SocketService {
  private io: SocketIOServer | null = null;
  private isRecordingActive: boolean = false;
  private isStreamActive: boolean = false;
  private streamTimeout: NodeJS.Timeout | null = null;

  constructor(
    @inject(TYPES.VideoService) private videoService: VideoService,
    @inject(TYPES.SystemParametersRepository)
    private systemParametersRepository: ISystemParametersRepository,
  ) {}

  private updateStreamActivity() {
    if (!this.isStreamActive) {
      this.isStreamActive = true;
      this.systemParametersRepository.updateStatus("Active").catch(console.error);
    }

    if (this.streamTimeout) {
      clearTimeout(this.streamTimeout);
    }

    this.streamTimeout = setTimeout(() => {
      this.isStreamActive = false;
      this.systemParametersRepository.updateStatus("Inactive").catch(console.error);
    }, 5000); // Inactive after 5 seconds of no stream data
  }

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      socket.on("stream-data", (data: Buffer) => {
        this.updateStreamActivity();
        this.io?.to("live-stream-clients").emit("live-stream-data", data);

        if (
          this.isRecordingActive &&
          !this.videoService.isRecording(socket.id)
        ) {
          // Default to unknown if started without user context (e.g. from public index.html)
          this.videoService.startRecording(socket.id, "user");
        }

        if (this.videoService.isRecording(socket.id)) {
          this.videoService.addFrame(socket.id, data);
        }
      });

      socket.on("start-recording", (data?: { userId?: string }) => {
        this.isRecordingActive = true;

        this.io?.sockets.sockets.forEach((s) => {
          if (!s.rooms.has("live-stream-clients")) {
            this.videoService.startRecording(s.id, "user", data?.userId);
          }
        });

        this.io?.emit("recording-status", { active: true });
      });

      socket.on("stop-recording", () => {
        this.isRecordingActive = false;

        this.io?.sockets.sockets.forEach((s) => {
          if (this.videoService.isRecording(s.id)) {
            this.videoService.stopRecording(s.id);
          }
        });

        this.io?.emit("recording-status", { active: false });
      });

      socket.on("join-live-stream", () => {
        socket.join("live-stream-clients");
      });

      socket.on("disconnect", () => {});
    });
  }

  emitNotification(payload: any): void {
    if (this.io) {
      this.io.emit("notification", payload);
    }
  }

  broadcastStream(data: any): void {
    if (this.io) {
      this.io.to("live-stream-clients").emit("live-stream-data", data);
    }
  }

  startRecordingAll(
    durationMs: number = 10000,
    triggerType: string = "unknown",
  ): void {
    if (!this.io) return;

    this.isRecordingActive = true;
    this.io.emit("recording-status", { active: true });

    const sockets = this.io.sockets.sockets;
    sockets.forEach((socket) => {
      if (!socket.rooms.has("live-stream-clients")) {
        this.videoService.startRecording(socket.id, triggerType);
      }
    });

    setTimeout(() => {
      this.isRecordingActive = false;
      this.io?.emit("recording-status", { active: false });

      const sockets = this.io?.sockets.sockets;
      sockets?.forEach((socket) => {
        if (this.videoService.isRecording(socket.id)) {
          this.videoService.stopRecording(socket.id);
        }
      });
    }, durationMs);
  }
}
