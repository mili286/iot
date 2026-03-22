import { IQuery } from "../../../../cqrs/interfaces";
import { SystemParametersDto } from "./get-parameters.dto";

export class GetSystemParametersQuery implements IQuery<SystemParametersDto> {}
