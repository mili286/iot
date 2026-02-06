import Joi from "joi";

export const getRecordingByIdSchema = Joi.object({
  id: Joi.string().required(),
});
