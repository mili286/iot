import "reflect-metadata";

export const COMMAND_HANDLER_METADATA = "cqrs:command_handler";
export const QUERY_HANDLER_METADATA = "cqrs:query_handler";
export const VALIDATION_METADATA = "cqrs:validation";

export function CommandHandler(command: any): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  };
}

export function QueryHandler(query: any): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
  };
}

export function Validate(schema: any): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(VALIDATION_METADATA, schema, target);
  };
}
