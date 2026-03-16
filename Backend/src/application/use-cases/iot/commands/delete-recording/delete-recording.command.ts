import { ICommand } from "../../../../cqrs/interfaces";

export class DeleteRecordingCommand implements ICommand {
  constructor(public readonly id: string) {}
}
