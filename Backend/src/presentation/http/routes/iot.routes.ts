import { Router } from "express";
import { container } from "../../../di/container";
import { TYPES } from "../../../shared/types/common.types";
import { IoTController } from "../controllers/iot.controller";
import { RecordingController } from "../controllers/recording.controller";
import { upload } from "../../../infrastructure/storage/multer.config";

const router = Router();
const iotController = container.get<IoTController>(TYPES.IoTController);
const recordingController = container.get<RecordingController>(
  TYPES.RecordingController,
);

/**
 * @openapi
 * /api/events/trigger:
 *   post:
 *     description: ESP32 sends a trigger (motion or button)
 *     responses:
 *       200:
 *         description: Event triggered successfully
 */
router.post("/events/trigger", (req, res) =>
  iotController.triggerEvent(req, res),
);

/**
 * @openapi
 * /api/upload/stream:
 *   post:
 *     description: Upload a stream (image/video) from ESP32
 *     responses:
 *       200:
 *         description: Stream uploaded successfully
 */
router.post("/upload/stream", upload.single("file"), (req, res) =>
  iotController.uploadStream(req, res),
);

/**
 * @openapi
 * /api/recordings:
 *   get:
 *     description: Returns a list of all saved recordings
 *     responses:
 *       200:
 *         description: List of recordings
 */
router.get("/recordings", (req, res) =>
  recordingController.getRecordings(req, res),
);

/**
 * @openapi
 * /api/recordings/{id}:
 *   get:
 *     description: Streams a specific recording
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video stream
 */
router.get("/recordings/:id", (req, res) =>
  recordingController.streamRecording(req, res),
);

export default router;
