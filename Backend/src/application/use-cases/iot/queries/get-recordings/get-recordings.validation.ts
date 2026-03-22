import Joi from "joi";

export const getRecordingsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  searchTerm: Joi.string().allow("").optional(),
  triggerType: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().optional(),
});
