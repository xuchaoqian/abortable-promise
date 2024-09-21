"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortControllerPlus = void 0;
const internal_1 = require("./internal");
class AbortControllerPlus {
    /**
     * Creates a new AbortControllerPlus instance
     *
     * @param {AbortController} [controller] - The controller to use, optional
     */
    constructor(controller) {
        this._controller = controller ?? new AbortController();
        this._signal = new internal_1.AbortSignalPlus(this);
    }
    /**
     * Returns the signal for the controller
     *
     * @returns {AbortSignalPlus}
     */
    get signal() {
        return this._signal;
    }
    /**
     * Aborts the controller
     *
     * @param {any} [reason] - The reason for aborting, optional
     */
    abort(reason) {
        this._controller.abort(reason ?? new internal_1.AbortError());
    }
    /**
     * Returns the JSON representation of the controller
     *
     * @returns {any}
     */
    toJSON() {
        return { controller: this._controller, signal: this._signal };
    }
}
exports.AbortControllerPlus = AbortControllerPlus;
exports.default = AbortControllerPlus;
//# sourceMappingURL=abort-controller-plus.js.map