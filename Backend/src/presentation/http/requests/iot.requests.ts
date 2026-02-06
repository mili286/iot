import { Request } from "express";

interface TriggerEventRequest
  extends Request<
    any,
    any,
    {
      type: "motion" | "button";
      timestamp?: string;
    }
  > {}

interface UploadStreamRequest extends Request {}

export { TriggerEventRequest, UploadStreamRequest };
