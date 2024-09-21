"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
exports.isTimeoutError = isTimeoutError;
class TimeoutError extends DOMException {
    constructor(message) {
        if (typeof message === "undefined") {
            message = "The operation was aborted due to timeout";
        }
        else if (typeof message === "string") {
            // do nothing
        }
        else if (message instanceof Error) {
            message = `${message.name}: ${message.message}`;
        }
        else {
            message = message.toString();
        }
        super(message, "TimeoutError");
    }
}
exports.TimeoutError = TimeoutError;
function isTimeoutError(error) {
    return error instanceof DOMException && error.name === "TimeoutError";
}
//# sourceMappingURL=timeout-error.js.map