import Joi from "joi";

export const deleteRecordingValidationSchema = Joi.object({
  id: Joi.string().required(),
});
