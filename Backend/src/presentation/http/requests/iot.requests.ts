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

interface UploadStreamRequest
  extends Request<
    any,
    any,
    {
      duration?: string;
      triggerType?: string;
    }
  > {}

export { TriggerEventRequest, UploadStreamRequest };
