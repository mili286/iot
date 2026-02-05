import Joi from "joi";

export const refreshTokenSchema = Joi.object({
  authToken: Joi.string().required(),
  refreshToken: Joi.string().required(),
});
