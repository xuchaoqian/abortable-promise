"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortError = void 0;
exports.isAbortError = isAbortError;
class AbortError extends DOMException {
    constructor(message) {
        if (typeof message === "undefined") {
            message = "This operation was aborted";
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
        super(message, "AbortError");
    }
}
exports.AbortError = AbortError;
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
//# sourceMappingURL=abort-error.js.map