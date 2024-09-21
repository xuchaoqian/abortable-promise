export class AbortError extends DOMException {
  constructor(message?: any) {
    if (typeof message === "undefined") {
      message = "This operation was aborted";
    } else if (typeof message === "string") {
      // do nothing
    } else if (message instanceof Error) {
      message = `${message.name}: ${message.message}`;
    } else {
      message = message.toString();
    }
    super(message, "AbortError");
  }
}

export function isAbortError(error: any): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
