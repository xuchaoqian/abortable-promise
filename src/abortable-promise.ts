import { AbortControllerPlus, AbortError, AbortSignalPlus } from "./internal";

export class AbortablePromise<T> extends Promise<T> {
  private _parent!: AbortablePromise<any>;
  private _reject!: (reason?: any) => void;
  private _isSettled: boolean;
  private _signal?: AbortSignal;

  /**
   * Creates a new AbortablePromise. The signal is optional, but if provided,
   * it will be used to abort the promise and pass the signal to the executor.
   *
   * @param {function} executor - The executor function.
   * @param {AbortSignal} [signal] - The abort signal.
   */
  constructor(
    executor: (
      resolve: (value: PromiseLike<T> | T) => void,
      reject: (reason?: any) => void,
      signal?: AbortSignal,
    ) => void,
    signal?: AbortSignal,
  ) {
    let thisResolve!: (value: PromiseLike<T> | T) => void;
    let thisReject!: (reason?: any) => void;
    super((resolve, reject) => {
      thisResolve = resolve;
      thisReject = reject;
    });
    this._parent = this;
    this._reject = thisReject;
    this._isSettled = false;
    if (typeof signal !== "undefined") {
      this.listen(signal);
    }
    executor(
      (value) => {
        thisResolve(value);
        this._isSettled = true;
      },
      (reason) => {
        thisReject(reason);
        this._isSettled = true;
      },
      signal,
    );
  }

  /**
   * Creates a new AbortablePromise. This is the same as new AbortablePromise(executor, signal),
   * just for consistency with the design of the newWithSignal method.
   *
   * @param {function} executor - The executor function.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  static new<T>(
    executor: (
      resolve: (value: PromiseLike<T> | T) => void,
      reject: (reason?: any) => void,
      signal?: AbortSignal,
    ) => void,
    signal?: AbortSignal,
  ): AbortablePromise<T> {
    return new AbortablePromise<T>(executor as any, signal);
  }

  /**
   * Creates a new AbortablePromise. This is basically the same as new
   * AbortablePromise(executor, signal), but this method will create a new
   * AbortSignalPlus if no signal is provided.
   *
   * @param {function} executor - The executor function.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  static newWithSignal<T>(
    executor: (
      resolve: (value: PromiseLike<T> | T) => void,
      reject: (reason?: any) => void,
      signal: AbortSignal,
    ) => void,
    signal?: AbortSignal,
  ): AbortablePromise<T> {
    return new AbortablePromise<T>(
      executor as any,
      signal ?? new AbortControllerPlus().signal,
    );
  }

  /**
   * Creates a new AbortablePromise from the given promise.
   *
   * @param {Promise<T>} promise - The promise to wrap.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  static from<T>(
    promise: Promise<T>,
    signal?: AbortSignal,
  ): AbortablePromise<T> {
    // If promise is already an AbortablePromise, return it directly.
    if (promise instanceof AbortablePromise) {
      return promise;
    }
    return new AbortablePromise<T>((resolve, reject) => {
      promise.then(resolve).catch(reject);
    }, signal);
  }

  /**
   * Creates a new AbortablePromise from the given promise. This is basically the
   * same as AbortablePromise.from, but this method will create a new AbortSignalPlus
   * if no signal is provided.
   *
   * @param {Promise<T>} promise - The promise to wrap.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  static fromWithSignal<T>(
    promise: Promise<T>,
    signal?: AbortSignal,
  ): AbortablePromise<T> {
    // If promise is already an AbortablePromise, return it directly.
    if (promise instanceof AbortablePromise) {
      return promise;
    }
    return new AbortablePromise<T>((resolve, reject) => {
      promise.then(resolve).catch(reject);
    }, signal ?? new AbortControllerPlus().signal);
  }

  /**
   * Aborts the promise.
   *
   * @param {any} [reason] - The reason for aborting.
   */
  abort(reason?: any): void {
    reason = reason ?? new AbortError();
    this._doAbort(reason);
    if (this._signal instanceof AbortSignalPlus) {
      this._signal.controller.abort(reason);
    } else if (this._signal) {
      Object.defineProperty(this._signal, "aborted", {
        value: true,
      });
      Object.defineProperty(this._signal, "reason", {
        value: reason,
      });
      this._signal.dispatchEvent(new Event("abort"));
    }
  }

  /**
   * Listens to the abort signal.
   *
   * @param {AbortSignal} signal - The abort signal to listen to.
   * @returns {AbortablePromise<T>} - The AbortablePromise.
   */
  listen(signal: AbortSignal): AbortablePromise<T> {
    this._signal = signal;
    if (signal.aborted) {
      this._doAbort(signal.reason);
    } else {
      signal.addEventListener(
        "abort",
        () => {
          this._doAbort(signal.reason);
        },
        { once: true },
      );
    }
    return this;
  }

  /**
   * Adds a callback to the promise.
   *
   * @param {function} onfulfilled - The callback to execute when the promise is fulfilled.
   * @param {function} onrejected - The callback to execute when the promise is rejected.
   * @returns {AbortablePromise<TResult1 | TResult2>} - The new AbortablePromise.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): AbortablePromise<TResult1 | TResult2> {
    const newPromise = super.then(onfulfilled, onrejected) as AbortablePromise<
      TResult1 | TResult2
    >;
    // Propagate the abort functionality through the promise chain.
    // We reuse the original _sourceReject to ensure that aborting any promise
    // in the chain will abort the entire chain, maintaining consistent behavior.
    newPromise._parent = this;
    return newPromise;
  }

  /**
   * Adds a callback to the promise.
   *
   * @param {function} onrejected - The callback to execute when the promise is rejected.
   * @returns {AbortablePromise<T | TResult>} - The new AbortablePromise.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): AbortablePromise<T | TResult> {
    const newPromise = super.catch(onrejected) as AbortablePromise<T | TResult>;
    // Propagate the abort functionality through the promise chain.
    // We reuse the original _sourceReject to ensure that aborting any promise
    // in the chain will abort the entire chain, maintaining consistent behavior.
    newPromise._parent = this;
    return newPromise;
  }

  /**
   * Adds a callback to the promise.
   *
   * @param {function} onfinally - The callback to execute when the promise is finally.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  finally(onfinally?: (() => void) | undefined | null): AbortablePromise<T> {
    const newPromise = super.finally(onfinally) as AbortablePromise<T>;
    // Propagate the abort functionality through the promise chain.
    // We reuse the original _sourceReject to ensure that aborting any promise
    // in the chain will abort the entire chain, maintaining consistent behavior.
    newPromise._parent = this;
    return newPromise;
  }

  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve, or rejected when any Promise is rejected.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>[]>} - The new AbortablePromise.
   */
  static all<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>[]> {
    return AbortablePromise.from(Promise.all(values), signal);
  }

  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve, or rejected when any Promise is rejected. This is
   * basically the same as AbortablePromise.all, but this method will create a new
   * AbortSignalPlus if no signal is provided.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>[]>} - The new AbortablePromise.
   */
  static allWithSignal<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>[]> {
    return AbortablePromise.fromWithSignal(Promise.all(values), signal);
  }

  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<PromiseSettledResult<Awaited<T>>[]>} - The new AbortablePromise.
   */
  static allSettled<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<PromiseSettledResult<Awaited<T>>[]> {
    return AbortablePromise.from(Promise.allSettled<T>(values), signal);
  }

  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve or reject. This is basically the same as
   * AbortablePromise.allSettled, but this method will create a new AbortSignalPlus
   * if no signal is provided.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<PromiseSettledResult<Awaited<T>>[]>} - The new AbortablePromise.
   */
  static allSettledWithSignal<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<PromiseSettledResult<Awaited<T>>[]> {
    return AbortablePromise.fromWithSignal(
      Promise.allSettled<T>(values),
      signal,
    );
  }

  /**
   * The any function returns a promise that is fulfilled by the first given promise
   * to be fulfilled, or rejected with an AggregateError containing an array of
   * rejection reasons if all of the given promises are rejected.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
   */
  static any<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>> {
    return AbortablePromise.from(Promise.any<T>(values), signal);
  }

  /**
   * The any function returns a promise that is fulfilled by the first given promise
   * to be fulfilled, or rejected with an AggregateError containing an array of
   * rejection reasons if all of the given promises are rejected. This is basically
   * the same as AbortablePromise.any, but this method will create a new AbortSignalPlus
   * if no signal is provided.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
   */
  static anyWithSignal<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>> {
    return AbortablePromise.fromWithSignal(Promise.any<T>(values), signal);
  }

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises
   * are resolved or rejected.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
   */
  static race<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>> {
    return AbortablePromise.from(Promise.race<T>(values), signal);
  }

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises
   * are resolved or rejected. This is basically the same as AbortablePromise.race,
   * but this method will create a new AbortSignalPlus if no signal is provided.
   *
   * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
   * @param {AbortSignal} [signal] - The abort signal.
   * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
   */
  static raceWithSignal<T>(
    values: Iterable<T | PromiseLike<T>>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>> {
    return AbortablePromise.fromWithSignal(Promise.race<T>(values), signal);
  }

  /**
   * Creates a new resolved promise for the void value.
   * @returns A resolved promise.
   */
  static resolve(): AbortablePromise<void>;
  /**
   * Creates a new resolved promise for the provided non-promise-like value.
   * @param value A non-promise-like value.
   * @returns A promise whose internal state matches the provided non-promise-like value.
   */
  static resolve<T>(value: T): AbortablePromise<Awaited<T>>;
  /**
   * Creates a new resolved promise for the provided promise-like value.
   * @param value A promise-like value.
   * @param [signal] The abort signal.
   * @returns A promise whose internal state matches the provided promise-like value.
   */
  static resolve<T>(
    value: PromiseLike<T>,
    signal?: AbortSignal,
  ): AbortablePromise<Awaited<T>>;
  /**
   * Creates a new resolved promise for the provided promise-like value or non-promise-like value.
   *
   * @param [value] A promise-like value or non-promise-like value.
   * @param [signal] The abort signal.
   * @returns A promise whose internal state matches the provided value.
   */
  static resolve(value?: any, signal?: AbortSignal): AbortablePromise<any> {
    return AbortablePromise.from(Promise.resolve(value), signal);
  }

  /**
   * Creates a new resolved promise for the provided promise-like value or non-promise-like value.
   * This is basically the same as AbortablePromise.resolve, but this method will create a new
   * AbortSignalPlus if no signal is provided.
   *
   * @param [value] A promise-like value or non-promise-like value.
   * @param [signal] The abort signal.
   * @returns A promise whose internal state matches the provided value.
   */
  static resolveWithSignal(
    value?: any,
    signal?: AbortSignal,
  ): AbortablePromise<any> {
    return AbortablePromise.fromWithSignal(Promise.resolve(value), signal);
  }

  /**
   * Creates a new rejected promise.
   *
   * @param {any} reason - The reason for rejecting the promise.
   * @returns {AbortablePromise<T>} - The new AbortablePromise.
   */
  static reject<T = never>(reason?: any): AbortablePromise<T> {
    return AbortablePromise.from(Promise.reject<T>(reason));
  }

  _doAbort(reason?: any): void {
    // We need to walk up the promise chain and abort all promises that are not
    // settled yet. We do this by walking up the chain and aborting all promises
    // that are not settled yet.
    let source: AbortablePromise<any> = this;
    while (true) {
      if (source === source._parent) {
        break;
      }
      if (source._parent._isSettled) {
        break;
      }
      source = source._parent;
    }
    source._reject(reason);
  }
}
