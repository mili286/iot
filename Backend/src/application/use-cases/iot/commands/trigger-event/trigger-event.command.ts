import { ICommand } from "../../../../cqrs/interfaces";
import { Validate } from "../../../../cqrs/decorators";
import { triggerEventSchema } from "./trigger-event.validation";
import { TriggerEventDto } from "./trigger-event.dto";

@Validate(triggerEventSchema)
export class TriggerEventCommand implements ICommand<TriggerEventDto> {
  constructor(
    public readonly type: "motion" | "button",
    public readonly timestamp: Date = new Date(),
  ) {}
}
