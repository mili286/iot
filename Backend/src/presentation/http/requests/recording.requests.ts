import { Request } from "express";

interface GetRecordingsRequest extends Request<
  any,
  any,
  any,
  {
    page?: string;
    limit?: string;
    searchTerm?: string;
    triggerType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }
> {}

interface StreamRecordingRequest
  extends Request<
    {
      id: string;
    },
    any,
    any,
    {
      download?: string;
    }
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
