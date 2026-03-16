import Joi from "joi";

export const registerUserSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  fullName: Joi.string().required().min(2).max(100),
});
