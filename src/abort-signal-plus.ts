import { AbortControllerPlus, isTimeoutError, TimeoutError } from "./internal";

export class AbortSignalPlus implements AbortSignal {
  private _controller: AbortControllerPlus;
  private _signal: AbortSignal;
  private _timer?: NodeJS.Timeout | number;
  private _timeout?: number;

  /**
   * Creates a new AbortSignalPlus instance
   *
   * @param {AbortController} [controller] - The controller for the signal, optional
   */
  constructor(controller?: AbortController) {
    this._controller = AbortSignalPlus._createController(controller);
    this._signal = (this._controller as any)._controller.signal;
  }

  /**
   * Creates a new AbortSignalPlus instance from an AbortSignal
   *
   * @param {AbortSignal} signal - The signal to create from
   * @returns {AbortSignalPlus}
   */
  static from(signal: AbortSignal): AbortSignalPlus {
    if (signal instanceof AbortSignalPlus) {
      return signal;
    }
    return AbortSignalPlus.one(signal);
  }

  /**
   * Returns the controller for the signal
   *
   * @returns {AbortControllerPlus}
   */
  get controller(): AbortControllerPlus {
    return this._controller;
  }

  /**
   * Returns true if the signal is aborted
   *
   * @returns {boolean}
   */
  get aborted(): boolean {
    return this._signal.aborted;
  }

  /**
   * Returns the reason for aborting
   *
   * @returns {any}
   */
  get reason(): any {
    return this._signal.reason;
  }

  /**
   * Throws an error if the signal is aborted
   *
   * @throws {AbortError}
   */
  throwIfAborted(): void {
    this._signal.throwIfAborted();
  }

  /**
   * Adds an event listener to the signal
   *
   * @param {string} type - The type of event to listen for
   * @param {EventListenerOrEventListenerObject} listener - The listener to add
   * @param {boolean | AddEventListenerOptions} [options] - Options for the event listener, optional
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this._signal.addEventListener(type, listener, options);
  }

  /**
   * Removes an event listener from the signal
   *
   * @param {string} type - The type of event to remove
   * @param {EventListenerOrEventListenerObject} listener - The listener to remove
   * @param {boolean | EventListenerOptions} options - Options for the event listener
   */
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this._signal.removeEventListener(type, listener, options);
  }

  /**
   * Dispatches an event to the signal
   *
   * @param {Event} event - The event to dispatch
   * @returns {boolean}
   */
  dispatchEvent(event: Event): boolean {
    return this._signal.dispatchEvent(event);
  }

  /**
   * Sets the onabort listener for the signal
   *
   * @param {((this: AbortSignal, ev: Event) => any) | null} listener - The listener to set
   */
  set onabort(listener: ((this: AbortSignal, ev: Event) => any) | null) {
    this._signal.onabort = listener;
  }

  /**
   * Sets a timeout on the signal
   *
   * @param {number} milliseconds - The number of milliseconds to wait before aborting
   * @returns {AbortSignalPlus}
   */
  timeout(milliseconds: number): AbortSignalPlus {
    clearTimeout(this._timer);
    this._timeout = milliseconds;
    this._timer = setTimeout(() => {
      this._controller.abort(new TimeoutError());
      this._timer = undefined;
      this._timeout = undefined;
    }, milliseconds);
    this._signal.addEventListener(
      "abort",
      () => {
        clearTimeout(this._timer);
        this._timer = undefined;
        this._timeout = undefined;
      },
      { once: true },
    );
    return this;
  }

  /**
   * Returns true if the signal has a timeout
   *
   * @returns {boolean}
   */
  hasTimeout(): boolean {
    return typeof this._timer !== "undefined";
  }

  /**
   * Sets a timeout on the signal
   *
   * @param {number} milliseconds - The number of milliseconds to wait before aborting
   * @param {AbortController} [controller] - The controller to set the timeout on, optional
   * @returns {AbortSignalPlus}
   */
  static timeout(
    milliseconds: number,
    controller?: AbortController,
  ): AbortSignalPlus {
    return AbortSignalPlus._createController(controller).signal.timeout(
      milliseconds,
    );
  }

  /**
   * Aborts the source signal if the dependent signal is aborted
   *
   * @param {AbortSignal} signal - The dependent signal to check
   * @returns {AbortSignalPlus}
   */
  one(signal: AbortSignal): AbortSignalPlus {
    this._listen(signal);
    return this;
  }

  /**
   * Aborts the source signal if the dependent signal is aborted
   *
   * @param {AbortSignal} signal - The dependent signal to check
   * @param {AbortController} [controller] - The source controller to abort, optional
   * @returns {AbortSignalPlus}
   */
  static one(
    signal: AbortSignal,
    controller?: AbortController,
  ): AbortSignalPlus {
    return AbortSignalPlus._createController(controller).signal.one(signal);
  }

  /**
   * Aborts the source signal if any of the dependent signals are aborted
   *
   * @param {Iterable<AbortSignal>} signals - The dependent signals to check
   * @returns {AbortSignalPlus}
   */
  any(signals: Iterable<AbortSignal>): AbortSignalPlus {
    for (const signal of signals) {
      if (this._listen(signal)) {
        return this;
      }
    }
    return this;
  }

  /**
   * Aborts the source signal if any of the dependent signals are aborted
   *
   * @param {Iterable<AbortSignal>} signals - The dependent signals to check
   * @param {AbortController} [controller] - The source controller to abort, optional
   * @returns {AbortSignalPlus}
   */
  static any(
    signals: Iterable<AbortSignal>,
    controller?: AbortController,
  ): AbortSignalPlus {
    return AbortSignalPlus._createController(controller).signal.any(signals);
  }

  /**
   * Returns the JSON representation of the signal
   *
   * @returns {any}
   */
  toJSON(): any {
    return {
      signal: this._signal,
      timeout: this._timeout,
    };
  }

  static _createController(controller?: AbortController): AbortControllerPlus {
    if (typeof controller === "undefined") {
      return new AbortControllerPlus();
    }
    if (controller instanceof AbortControllerPlus) {
      return controller;
    }
    return new AbortControllerPlus(controller);
  }

  _listen(signal: AbortSignal): boolean {
    if (signal.aborted) {
      isTimeoutError(signal.reason);
      this._controller.abort(
        isTimeoutError(signal.reason) ? new TimeoutError() : signal.reason,
      );
      return true;
    }
    signal.addEventListener(
      "abort",
      () => {
        this._controller.abort(
          isTimeoutError(signal.reason) ? new TimeoutError() : signal.reason,
        );
      },
      { once: true },
    );
    return false;
  }
}

export default AbortSignalPlus;
