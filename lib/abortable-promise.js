"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbortablePromise = void 0;
const internal_1 = require("./internal");
class AbortablePromise extends Promise {
    /**
     * Creates a new AbortablePromise. The signal is optional, but if provided,
     * it will be used to abort the promise and pass the signal to the executor.
     *
     * @param {function} executor - The executor function.
     * @param {AbortSignal} [signal] - The abort signal.
     */
    constructor(executor, signal) {
        let thisResolve;
        let thisReject;
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
        executor((value) => {
            thisResolve(value);
            this._isSettled = true;
        }, (reason) => {
            thisReject(reason);
            this._isSettled = true;
        }, signal);
    }
    /**
     * Creates a new AbortablePromise. This is the same as new AbortablePromise(executor, signal),
     * just for consistency with the design of the newWithSignal method.
     *
     * @param {function} executor - The executor function.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static new(executor, signal) {
        return new AbortablePromise(executor, signal);
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
    static newWithSignal(executor, signal) {
        return new AbortablePromise(executor, signal ?? new internal_1.AbortControllerPlus().signal);
    }
    /**
     * Creates a new AbortablePromise from the given promise.
     *
     * @param {Promise<T>} promise - The promise to wrap.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static from(promise, signal) {
        // If promise is already an AbortablePromise, return it directly.
        if (promise instanceof AbortablePromise) {
            return promise;
        }
        return new AbortablePromise((resolve, reject) => {
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
    static fromWithSignal(promise, signal) {
        // If promise is already an AbortablePromise, return it directly.
        if (promise instanceof AbortablePromise) {
            return promise;
        }
        return new AbortablePromise((resolve, reject) => {
            promise.then(resolve).catch(reject);
        }, signal ?? new internal_1.AbortControllerPlus().signal);
    }
    /**
     * Aborts the promise.
     *
     * @param {any} [reason] - The reason for aborting.
     */
    abort(reason) {
        reason = reason ?? new internal_1.AbortError();
        this._doAbort(reason);
        if (this._signal instanceof internal_1.AbortSignalPlus) {
            this._signal.controller.abort(reason);
        }
        else if (this._signal) {
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
    listen(signal) {
        this._signal = signal;
        if (signal.aborted) {
            this._doAbort(signal.reason);
        }
        else {
            signal.addEventListener("abort", () => {
                this._doAbort(signal.reason);
            }, { once: true });
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
    then(onfulfilled, onrejected) {
        const newPromise = super.then(onfulfilled, onrejected);
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
    catch(onrejected) {
        const newPromise = super.catch(onrejected);
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
    finally(onfinally) {
        const newPromise = super.finally(onfinally);
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
    static all(values, signal) {
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
    static allWithSignal(values, signal) {
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
    static allSettled(values, signal) {
        return AbortablePromise.from(Promise.allSettled(values), signal);
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
    static allSettledWithSignal(values, signal) {
        return AbortablePromise.fromWithSignal(Promise.allSettled(values), signal);
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
    static any(values, signal) {
        return AbortablePromise.from(Promise.any(values), signal);
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
    static anyWithSignal(values, signal) {
        return AbortablePromise.fromWithSignal(Promise.any(values), signal);
    }
    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises
     * are resolved or rejected.
     *
     * @param {Iterable<T | PromiseLike<T>>} values - The promises to resolve.
     * @param {AbortSignal} [signal] - The abort signal.
     * @returns {AbortablePromise<Awaited<T>>} - The new AbortablePromise.
     */
    static race(values, signal) {
        return AbortablePromise.from(Promise.race(values), signal);
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
    static raceWithSignal(values, signal) {
        return AbortablePromise.fromWithSignal(Promise.race(values), signal);
    }
    /**
     * Creates a new resolved promise for the provided promise-like value or non-promise-like value.
     *
     * @param [value] A promise-like value or non-promise-like value.
     * @param [signal] The abort signal.
     * @returns A promise whose internal state matches the provided value.
     */
    static resolve(value, signal) {
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
    static resolveWithSignal(value, signal) {
        return AbortablePromise.fromWithSignal(Promise.resolve(value), signal);
    }
    /**
     * Creates a new rejected promise.
     *
     * @param {any} reason - The reason for rejecting the promise.
     * @returns {AbortablePromise<T>} - The new AbortablePromise.
     */
    static reject(reason) {
        return AbortablePromise.from(Promise.reject(reason));
    }
    _doAbort(reason) {
        // We need to walk up the promise chain and abort all promises that are not
        // settled yet. We do this by walking up the chain and aborting all promises
        // that are not settled yet.
        let source = this;
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
exports.AbortablePromise = AbortablePromise;
//# sourceMappingURL=abortable-promise.js.map