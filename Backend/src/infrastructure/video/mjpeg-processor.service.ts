import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { injectable } from "inversify";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
    return new Promise((resolve, reject) => {
      ffmpeg(mjpegPath)
        .inputOptions(["-f mjpeg", "-r 5"]) // Assume 5 fps as in VideoService
        .videoCodec("libx264")
        .outputOptions("-pix_fmt yuv420p")
        .on("end", () => {
          const stats = fs.statSync(outputMp4Path);
          resolve({ duration, size: stats.size });
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .save(outputMp4Path);
    });
  }

  private async appendToMp4(
    mjpegPath: string,
    existingMp4Path: string,
    outputMp4Path: string,
    newDuration: number,
  ): Promise<{ duration: number; size: number }> {
    // 1. Convert MJPEG to a temp MP4
    const tempMp4Path = path.join(
      path.dirname(mjpegPath),
      `temp-${Date.now()}.mp4`,
    );
    await this.convertToMp4(mjpegPath, tempMp4Path, 5); // Temporary duration for conversion

    // 2. Concatenate existing MP4 and temp MP4
    const finalMp4Path = path.join(
      path.dirname(outputMp4Path),
      `final-${Date.now()}.mp4`,
    );

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(existingMp4Path)
        .input(tempMp4Path)
        .on("error", (err) => {
          console.error("FFmpeg concat error:", err);
          if (fs.existsSync(tempMp4Path)) fs.unlinkSync(tempMp4Path);
          reject(err);
        })
        .on("end", () => {
          // Cleanup
          if (fs.existsSync(tempMp4Path)) fs.unlinkSync(tempMp4Path);
          
          // Replace outputMp4Path with finalMp4Path
          if (fs.existsSync(outputMp4Path) && outputMp4Path !== finalMp4Path) {
             // fs.unlinkSync(outputMp4Path); // Will be overwritten by rename
          }
          
          fs.renameSync(finalMp4Path, outputMp4Path);
          
          const stats = fs.statSync(outputMp4Path);
          resolve({ duration: newDuration, size: stats.size });
        })
        .mergeToFile(finalMp4Path, path.dirname(finalMp4Path));
    });
  }
}
