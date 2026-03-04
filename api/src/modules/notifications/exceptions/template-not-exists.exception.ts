export class TemplateNotExistsException extends Error {
  public constructor(path: string) {
    super(`Template does not exist or is not readable: ${path}`);
    this.name = TemplateNotExistsException.name;
  }
}
