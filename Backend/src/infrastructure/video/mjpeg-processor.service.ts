import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import { injectable } from "inversify";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

@injectable()
export class MjpegProcessorService {
  /**
   * Converts an MJPEG file to MP4.
   * If existingMp4Path is provided, it appends the MJPEG to it.
   * Returns the new duration and size.
   */
  async processMjpeg(
    mjpegPath: string,
    outputMp4Path: string,
    existingMp4Path?: string,
    addedDuration: number = 5,
    existingDuration: number = 0,
  ): Promise<{ duration: number; size: number }> {
    if (existingMp4Path && fs.existsSync(existingMp4Path)) {
      return this.appendToMp4(
        mjpegPath,
        existingMp4Path,
        outputMp4Path,
        existingDuration + addedDuration,
      );
    } else {
      return this.convertToMp4(mjpegPath, outputMp4Path, addedDuration);
    }
  }

  private async convertToMp4(
    mjpegPath: string,
    outputMp4Path: string,
    duration: number,
  ): Promise<{ duration: number; size: number }> {
    const normalizedInputPath = mjpegPath.replace(/\\/g, "/");
    const normalizedOutputPath = outputMp4Path.replace(/\\/g, "/");

    if (
      !fs.existsSync(normalizedInputPath) ||
      fs.statSync(normalizedInputPath).size === 0
    ) {
      throw new Error(
        `Input MJPEG file is empty or does not exist: ${normalizedInputPath}`,
      );
    }

    return new Promise((resolve, reject) => {
      ffmpeg(normalizedInputPath)
        .inputOptions([
          "-f mjpeg",
          "-vcodec mjpeg",
          "-r 5",
          "-probesize 10M",
          "-analyzeduration 10M",
        ])
        .videoCodec("libx264")
        .outputOptions(["-pix_fmt yuv420p", "-movflags +faststart"])
        .on("start", (commandLine) => {
          console.log(`Running FFmpeg command: ${commandLine}`);
        })
        .on("end", () => {
          const stats = fs.statSync(normalizedOutputPath);
          resolve({ duration, size: stats.size });
        })
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg error:", err.message);
          console.error("FFmpeg stderr:", stderr);
          reject(err);
        })
        .save(normalizedOutputPath);
    });
  }

  private async appendToMp4(
    mjpegPath: string,
    existingMp4Path: string,
    outputMp4Path: string,
    newDuration: number,
  ): Promise<{ duration: number; size: number }> {
    const normalizedMjpegPath = mjpegPath.replace(/\\/g, "/");
    const normalizedExistingPath = existingMp4Path.replace(/\\/g, "/");
    const normalizedOutputPath = outputMp4Path.replace(/\\/g, "/");

    // 1. Convert MJPEG to a temp MP4
    const tempMp4Path = path
      .join(path.dirname(normalizedMjpegPath), `temp-${Date.now()}.mp4`)
      .replace(/\\/g, "/");

    await this.convertToMp4(normalizedMjpegPath, tempMp4Path, 5); // Temporary duration for conversion

    // 2. Concatenate existing MP4 and temp MP4
    const finalMp4Path = path
      .join(path.dirname(normalizedOutputPath), `final-${Date.now()}.mp4`)
      .replace(/\\/g, "/");

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(normalizedExistingPath)
        .input(tempMp4Path)
        .on("start", (commandLine) => {
          console.log(`Running FFmpeg concat command: ${commandLine}`);
        })
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg concat error:", err.message);
          console.error("FFmpeg concat stderr:", stderr);
          if (fs.existsSync(tempMp4Path)) fs.unlinkSync(tempMp4Path);
          reject(err);
        })
        .on("end", () => {
          // Cleanup
          if (fs.existsSync(tempMp4Path)) fs.unlinkSync(tempMp4Path);

          // Replace outputMp4Path with finalMp4Path
          if (
            fs.existsSync(normalizedOutputPath) &&
            normalizedOutputPath !== finalMp4Path
          ) {
            // Overwritten by renameSync
          }

          fs.renameSync(finalMp4Path, normalizedOutputPath);

          const stats = fs.statSync(normalizedOutputPath);
          resolve({ duration: newDuration, size: stats.size });
        })
        .mergeToFile(finalMp4Path, path.dirname(finalMp4Path));
    });
  }
}
