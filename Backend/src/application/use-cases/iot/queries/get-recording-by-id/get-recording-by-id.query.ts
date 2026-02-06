import { IQuery } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { RecordingDetailDto } from "./get-recording-by-id.dto";
import { getRecordingByIdSchema } from "./get-recording-by-id.validation";

@Validate(getRecordingByIdSchema)
export class GetRecordingByIdQuery implements IQuery<RecordingDetailDto | null> {
  constructor(public readonly id: string) {}
}
