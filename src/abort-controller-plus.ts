import { AbortError, AbortSignalPlus } from "./internal";

export class AbortControllerPlus implements AbortController {
  private _controller: AbortController;
  private _signal: AbortSignalPlus;

  /**
   * Creates a new AbortControllerPlus instance
   *
   * @param {AbortController} [controller] - The controller to use, optional
   */
  constructor(controller?: AbortController) {
    this._controller = controller ?? new AbortController();
    this._signal = new AbortSignalPlus(this);
  }

  /**
   * Returns the signal for the controller
   *
   * @returns {AbortSignalPlus}
   */
  get signal(): AbortSignalPlus {
    return this._signal;
  }

  /**
   * Aborts the controller
   *
   * @param {any} [reason] - The reason for aborting, optional
   */
  abort(reason?: any): void {
    this._controller.abort(reason ?? new AbortError());
  }

  /**
   * Returns the JSON representation of the controller
   *
   * @returns {any}
   */
  toJSON(): any {
    return { controller: this._controller, signal: this._signal };
  }
}

export default AbortControllerPlus;
