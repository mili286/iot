import Joi from "joi";

export const saveRecordingSchema = Joi.object({
  filename: Joi.string().required(),
  path: Joi.string().required(),
  mimetype: Joi.string().required(),
  size: Joi.number().required(),
});
