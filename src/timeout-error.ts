export class TimeoutError extends DOMException {
  constructor(message?: any) {
    if (typeof message === "undefined") {
      message = "The operation was aborted due to timeout";
    } else if (typeof message === "string") {
      // do nothing
    } else if (message instanceof Error) {
      message = `${message.name}: ${message.message}`;
    } else {
      message = message.toString();
    }
    super(message, "TimeoutError");
  }
}

export function isTimeoutError(error: any): boolean {
  return error instanceof DOMException && error.name === "TimeoutError";
}
