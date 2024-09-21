import { AbortControllerPlus } from "./internal";
export declare class AbortSignalPlus implements AbortSignal {
    private _controller;
    private _signal;
    private _timer?;
    private _timeout?;
    /**
     * Creates a new AbortSignalPlus instance
     *
     * @param {AbortController} [controller] - The controller for the signal, optional
     */
    constructor(controller?: AbortController);
    /**
     * Creates a new AbortSignalPlus instance from an AbortSignal
     *
     * @param {AbortSignal} signal - The signal to create from
     * @returns {AbortSignalPlus}
     */
    static from(signal: AbortSignal): AbortSignalPlus;
    /**
     * Returns the controller for the signal
     *
     * @returns {AbortControllerPlus}
     */
    get controller(): AbortControllerPlus;
    /**
     * Returns true if the signal is aborted
     *
     * @returns {boolean}
     */
    get aborted(): boolean;
    /**
     * Returns the reason for aborting
     *
     * @returns {any}
     */
    get reason(): any;
    /**
     * Throws an error if the signal is aborted
     *
     * @throws {AbortError}
     */
    throwIfAborted(): void;
    /**
     * Adds an event listener to the signal
     *
     * @param {string} type - The type of event to listen for
     * @param {EventListenerOrEventListenerObject} listener - The listener to add
     * @param {boolean | AddEventListenerOptions} [options] - Options for the event listener, optional
     */
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    /**
     * Removes an event listener from the signal
     *
     * @param {string} type - The type of event to remove
     * @param {EventListenerOrEventListenerObject} listener - The listener to remove
     * @param {boolean | EventListenerOptions} options - Options for the event listener
     */
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    /**
     * Dispatches an event to the signal
     *
     * @param {Event} event - The event to dispatch
     * @returns {boolean}
     */
    dispatchEvent(event: Event): boolean;
    /**
     * Sets the onabort listener for the signal
     *
     * @param {((this: AbortSignal, ev: Event) => any) | null} listener - The listener to set
     */
    set onabort(listener: ((this: AbortSignal, ev: Event) => any) | null);
    /**
     * Sets a timeout on the signal
     *
     * @param {number} milliseconds - The number of milliseconds to wait before aborting
     * @returns {AbortSignalPlus}
     */
    timeout(milliseconds: number): AbortSignalPlus;
    /**
     * Returns true if the signal has a timeout
     *
     * @returns {boolean}
     */
    hasTimeout(): boolean;
    /**
     * Sets a timeout on the signal
     *
     * @param {number} milliseconds - The number of milliseconds to wait before aborting
     * @param {AbortController} [controller] - The controller to set the timeout on, optional
     * @returns {AbortSignalPlus}
     */
    static timeout(milliseconds: number, controller?: AbortController): AbortSignalPlus;
    /**
     * Aborts the source signal if the dependent signal is aborted
     *
     * @param {AbortSignal} signal - The dependent signal to check
     * @returns {AbortSignalPlus}
     */
    one(signal: AbortSignal): AbortSignalPlus;
    /**
     * Aborts the source signal if the dependent signal is aborted
     *
     * @param {AbortSignal} signal - The dependent signal to check
     * @param {AbortController} [controller] - The source controller to abort, optional
     * @returns {AbortSignalPlus}
     */
    static one(signal: AbortSignal, controller?: AbortController): AbortSignalPlus;
    /**
     * Aborts the source signal if any of the dependent signals are aborted
     *
     * @param {Iterable<AbortSignal>} signals - The dependent signals to check
     * @returns {AbortSignalPlus}
     */
    any(signals: Iterable<AbortSignal>): AbortSignalPlus;
    /**
     * Aborts the source signal if any of the dependent signals are aborted
     *
     * @param {Iterable<AbortSignal>} signals - The dependent signals to check
     * @param {AbortController} [controller] - The source controller to abort, optional
     * @returns {AbortSignalPlus}
     */
    static any(signals: Iterable<AbortSignal>, controller?: AbortController): AbortSignalPlus;
    /**
     * Returns the JSON representation of the signal
     *
     * @returns {any}
     */
    toJSON(): any;
    static _createController(controller?: AbortController): AbortControllerPlus;
    _listen(signal: AbortSignal): boolean;
}
export default AbortSignalPlus;
