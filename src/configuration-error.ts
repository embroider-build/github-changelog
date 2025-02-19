export default class ConfigurationError {
  public name = "ConfigurationError";
  public message: string;

  constructor(message: string) {
    // eslint-disable-next-line prefer-rest-params
    Error.apply(this, arguments as any);
    this.message = message;
  }
}
