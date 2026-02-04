import { injectable, inject, Container } from "inversify";
import { ICommand, ICommandHandler, IQuery, IQueryHandler } from "./interfaces";
import { Result } from "../../shared/result";
import { VALIDATION_METADATA } from "./decorators";
import { Validator } from "./validator";

@injectable()
export class CommandBus {
  constructor(@inject(Container) private container: Container) {}

  async execute<TCommand extends ICommand, TResponse = void>(
    command: TCommand,
  ): Promise<Result<TResponse>> {
    const commandClass = command.constructor;

    // Automatic validation
    const schema = Reflect.getMetadata(VALIDATION_METADATA, commandClass);
    if (schema) {
      const validationResult = Validator.validate(schema, command);
      if (validationResult.isFailure) {
        return Result.failure<TResponse>(validationResult.error);
      }
    }

    const handler = this.container.get<ICommandHandler<TCommand, TResponse>>(
      this.getCommandIdentifier(commandClass),
    );
    return handler.handle(command);
  }

  private getCommandIdentifier(commandClass: any): string | symbol {
    return Symbol.for(`CommandHandler:${commandClass.name}`);
  }
}

@injectable()
export class QueryBus {
  constructor(@inject(Container) private container: Container) {}

  async execute<TQuery extends IQuery<TResponse>, TResponse>(
    query: TQuery,
  ): Promise<Result<TResponse>> {
    const queryClass = query.constructor;

    // Automatic validation
    const schema = Reflect.getMetadata(VALIDATION_METADATA, queryClass);
    if (schema) {
      const validationResult = Validator.validate(schema, query);
      if (validationResult.isFailure) {
        return Result.failure<TResponse>(validationResult.error);
      }
    }

    const handler = this.container.get<IQueryHandler<TQuery, TResponse>>(
      this.getQueryIdentifier(queryClass),
    );
    return handler.handle(query);
  }

  private getQueryIdentifier(queryClass: any): string | symbol {
    return Symbol.for(`QueryHandler:${queryClass.name}`);
  }
}
