export class DataAccessError extends Error {
  constructor(
    message: string,
    public readonly causeCode?: string,
  ) {
    super(message);
    this.name = "DataAccessError";
  }
}
