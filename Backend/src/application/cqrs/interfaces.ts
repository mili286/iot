import { Result } from "../../shared/result";

export interface ICommand {}

export interface ICommandWithResponse<TResponse> extends ICommand {}

export interface IQuery<TResponse> {}

export interface ICommandHandler<TCommand extends ICommand, TResponse = void> {
  handle(command: TCommand): Promise<Result<TResponse>>;
}

export interface IQueryHandler<TQuery extends IQuery<TResponse>, TResponse> {
  handle(query: TQuery): Promise<Result<TResponse>>;
}
