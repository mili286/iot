import { ICommand } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { saveRecordingSchema } from "./save-recording.validation";
import { SaveRecordingDto } from "./save-recording.dto";

@Validate(saveRecordingSchema)
export class SaveRecordingCommand implements ICommand<SaveRecordingDto> {
  constructor(
    public readonly filename: string,
    public readonly path: string,
    public readonly mimetype: string,
    public readonly size: number,
    public readonly duration: number,
    public readonly triggerType: string,
    public readonly recordingDate: Date,
    public readonly syncDate: Date,
    public readonly userId?: string,
  ) {}
}
