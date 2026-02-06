import { Request } from "express";

interface GetRecordingsRequest extends Request {}

interface StreamRecordingRequest
  extends Request<
    {
      id: string;
    },
    any,
    any
  > {}

export { GetRecordingsRequest, StreamRecordingRequest };
