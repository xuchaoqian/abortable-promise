export declare class AbortablePromise<T> extends Promise<T> {
    private _parent;
    private _reject;
    private _isSettled;
    private _signal?;
    /**
     * Creates a new AbortablePromise. The signal is optional, but if provided,
     * it will be used to abort the promise and pass the signal to the executor.
     *
     * @param {function} executor - The executor function.
     * @param {AbortSignal} [signal] - The abort signal.
     */
    constructor(executor: (resolve: (value: PromiseLike<T> | T) => void, reject: (reason?: any) => void, signal?: AbortSignal) => void, signal?: AbortSignal);
    /**
     * Creates a new AbortablePromise. This is the same as new AbortablePromise(executor, signal),
     * just for consistency with the design of the newWithSignal method.
     *
     * @param {function} executor - The executor function.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static new<T>(executor: (resolve: (value: PromiseLike<T> | T) => void, reject: (reason?: any) => void, signal?: AbortSignal) => void, signal?: AbortSignal): AbortablePromise<T>;
    /**
     * Creates a new AbortablePromise. This is basically the same as new
     * AbortablePromise(executor, signal), but this method will create a new
     * AbortSignalPlus if no signal is provided.
     *
     * @param {function} executor - The executor function.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static newWithSignal<T>(executor: (resolve: (value: PromiseLike<T> | T) => void, reject: (reason?: any) => void, signal: AbortSignal) => void, signal?: AbortSignal): AbortablePromise<T>;
    /**
     * Creates a new AbortablePromise from the given promise.
     *
     * @param {Promise<T>} promise - The promise to wrap.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static from<T>(promise: Promise<T>, signal?: AbortSignal): AbortablePromise<T>;
    /**
     * Creates a new AbortablePromise from the given promise. This is basically the
     * same as AbortablePromise.from, but this method will create a new AbortSignalPlus
     * if no signal is provided.
     *
     * @param {Promise<T>} promise - The promise to wrap.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static fromWithSignal<T>(promise: Promise<T>, signal?: AbortSignal): AbortablePromise<T>;
    /**
     * Aborts the promise.
     *
     * @param {any} [reason] - The reason for aborting.
     */
    abort(reason?: any): void;
    /**
     * Listens to the abort signal.
     *
     * @param {AbortSignal} signal - The abort signal to listen to.
     * @returns {AbortablePromise<T>} - The AbortablePromise.
     */
    listen(signal: AbortSignal): AbortablePromise<T>;
    /**
     * Adds a callback to the promise.
     *
     * @param {function} onfulfilled - The callback to execute when the promise is fulfilled.
     * @param {function} onrejected - The callback to execute when the promise is rejected.
     * @returns {AbortablePromise<TResult1 | TResult2>} - The new AbortablePromise.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): AbortablePromise<TResult1 | TResult2>;
    /**
     * Adds a callback to the promise.
     *
     * @param {function} onrejected - The callback to execute when the promise is rejected.
     * @returns {AbortablePromise<T | TResult>} - The new AbortablePromise.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AbortablePromise<T | TResult>;
    /**
     * Adds a callback to the promise.
     *
     * @param {function} onfinally - The callback to execute when the promise is finally.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    finally(onfinally?: (() => void) | undefined | null): AbortablePromise<T>;
    /**
     * Creates a Promise that is resolved with an array of results when all of the
     * provided Promises resolve, or rejected when any Promise is rejected.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<Awaited<T>[]>} - The new AbortablePromise.
     */
    static all<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>[]>;
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
    static allWithSignal<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>[]>;
    /**
     * Creates a Promise that is resolved with an array of results when all
     * of the provided Promises resolve or reject.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<PromiseSettledResult<Awaited<T>>[]>} - The new AbortablePromise.
     */
    static allSettled<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<PromiseSettledResult<Awaited<T>>[]>;
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
    static allSettledWithSignal<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<PromiseSettledResult<Awaited<T>>[]>;
    /**
     * The any function returns a promise that is fulfilled by the first given promise
     * to be fulfilled, or rejected with an AggregateError containing an array of
     * rejection reasons if all of the given promises are rejected.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
     */
    static any<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>>;
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
    static anyWithSignal<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>>;
    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises
     * are resolved or rejected.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
     */
    static race<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>>;
    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises
     * are resolved or rejected. This is basically the same as AbortablePromise.race,
     * but this method will create a new AbortSignalPlus if no signal is provided.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
     */
    static raceWithSignal<T>(values: Iterable<T | PromiseLike<T>>, signal?: AbortSignal): AbortablePromise<Awaited<T>>;
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
    static resolve<T>(value: PromiseLike<T>, signal?: AbortSignal): AbortablePromise<Awaited<T>>;
    /**
     * Creates a new resolved promise for the provided promise-like value or non-promise-like value.
     * This is basically the same as AbortablePromise.resolve, but this method will create a new
     * AbortSignalPlus if no signal is provided.
     *
     * @param [value] A promise-like value or non-promise-like value.
     * @param [signal] The abort signal.
     * @returns A promise whose internal state matches the provided value.
     */
    static resolveWithSignal(value?: any, signal?: AbortSignal): AbortablePromise<any>;
    /**
     * Creates a new rejected promise.
     *
     * @param {any} reason - The reason for rejecting the promise.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static reject<T = never>(reason?: any): AbortablePromise<T>;
    _doAbort(reason?: any): void;
}
