import { Request } from "express";

interface GetRecordingsRequest extends Request<
  any,
  any,
  any,
  {
    page?: string;
    limit?: string;
  }
> {}

interface StreamRecordingRequest
  extends Request<
    {
      id: string;
    },
    any,
    any
  > {}

interface DeleteRecordingRequest
  extends Request<
    {
      id: string;
    },
    any,
    any
  > {}

export { GetRecordingsRequest, StreamRecordingRequest, DeleteRecordingRequest };
