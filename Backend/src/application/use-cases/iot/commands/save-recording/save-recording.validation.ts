import Joi from "joi";

export const saveRecordingSchema = Joi.object({
  filename: Joi.string().required(),
  path: Joi.string().required(),
  mimetype: Joi.string().required(),
  size: Joi.number().required(),
  duration: Joi.number().required(),
  triggerType: Joi.string().required(),
  recordingDate: Joi.date().required(),
  syncDate: Joi.date().required(),
  userId: Joi.string().optional(),
});
