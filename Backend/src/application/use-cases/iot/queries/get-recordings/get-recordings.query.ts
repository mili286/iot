import { IQuery } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { RecordingDto } from "./get-recordings.dto";
import { getRecordingsSchema } from "./get-recordings.validation";

@Validate(getRecordingsSchema)
export class GetRecordingsQuery implements IQuery<RecordingDto[]> {}
