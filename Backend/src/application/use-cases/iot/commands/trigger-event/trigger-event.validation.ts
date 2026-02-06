import Joi from "joi";

export const triggerEventSchema = Joi.object({
  type: Joi.string().valid("motion", "button").required(),
  timestamp: Joi.date().optional(),
});
