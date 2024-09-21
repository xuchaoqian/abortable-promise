import { AbortSignalPlus } from "./internal";
export declare class AbortControllerPlus implements AbortController {
    private _controller;
    private _signal;
    /**
     * Creates a new AbortControllerPlus instance
     *
     * @param {AbortController} [controller] - The controller to use, optional
     */
    constructor(controller?: AbortController);
    /**
     * Returns the signal for the controller
     *
     * @returns {AbortSignalPlus}
     */
    get signal(): AbortSignalPlus;
    /**
     * Aborts the controller
     *
     * @param {any} [reason] - The reason for aborting, optional
     */
    abort(reason?: any): void;
    /**
     * Returns the JSON representation of the controller
     *
     * @returns {any}
     */
    toJSON(): any;
}
export default AbortControllerPlus;
