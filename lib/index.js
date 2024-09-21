"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promise = exports.AbortablePromise = exports.AbortSignal = exports.AbortSignalPlus = exports.AbortController = exports.AbortControllerPlus = exports.isTimeoutError = exports.TimeoutError = exports.isAbortError = exports.AbortError = void 0;
const internal_1 = require("./internal");
var internal_2 = require("./internal");
Object.defineProperty(exports, "AbortError", { enumerable: true, get: function () { return internal_2.AbortError; } });
Object.defineProperty(exports, "isAbortError", { enumerable: true, get: function () { return internal_2.isAbortError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return internal_2.TimeoutError; } });
Object.defineProperty(exports, "isTimeoutError", { enumerable: true, get: function () { return internal_2.isTimeoutError; } });
Object.defineProperty(exports, "AbortControllerPlus", { enumerable: true, get: function () { return internal_2.AbortControllerPlus; } });
Object.defineProperty(exports, "AbortController", { enumerable: true, get: function () { return internal_2.AbortControllerPlus; } });
Object.defineProperty(exports, "AbortSignalPlus", { enumerable: true, get: function () { return internal_2.AbortSignalPlus; } });
Object.defineProperty(exports, "AbortSignal", { enumerable: true, get: function () { return internal_2.AbortSignalPlus; } });
Object.defineProperty(exports, "AbortablePromise", { enumerable: true, get: function () { return internal_2.AbortablePromise; } });
Object.defineProperty(exports, "Promise", { enumerable: true, get: function () { return internal_2.AbortablePromise; } });
exports.default = internal_1.AbortablePromise;
//# sourceMappingURL=index.js.map