# AbortablePromise

A TypeScript library for creating abortable promises with ease.

[![npm version](https://badge.fury.io/js/@xuchaoqian%2Fabortable-promise.svg)](https://badge.fury.io/js/@xuchaoqian%2Fabortable-promise)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`AbortablePromise` extends the standard `Promise` functionality by adding the ability to abort ongoing asynchronous operations. When aborted, an `AbortablePromise` rejects with an `AbortError` or any custom reason you provide, allowing for clean and predictable error handling.

## Features

- Simple API, rich features, fully compatible with standard Promises
- Cooperates with AbortController very well, including the `fetch` API
- Provides a set of helper classes and functions to make abortable promises more intuitive and easier to use
- Written in TypeScript, with full type safety

## Installation

```bash
# Install using npm:
npm install @xuchaoqian/abortable-promise

# Install using pnpm:
pnpm install @xuchaoqian/abortable-promise

# Install using yarn:
yarn add @xuchaoqian/abortable-promise
```

## Usage

### 1. Creating an AbortablePromise

#### Using the constructor

```typescript
const abortablePromise = new AbortablePromise<string>((resolve, reject) => {
  setTimeout(() => resolve('Operation completed'), 3000);
});
```

#### Using static methods

```typescript
// use new(), this is the same as using constructor, just for API design consistency
const abortablePromise = AbortablePromise.new<string>((resolve, reject) => {
  setTimeout(() => resolve('Operation completed'), 3000);
});
// Or use newWithSignal() if you want the API to create a new AbortSignal for you automatically
const abortablePromise = AbortablePromise.newWithSignal<string>((resolve, reject, signal) => {
  signal.onabort = () => reject('Operation aborted');
  setTimeout(() => resolve('Operation completed'), 3000);
});
```

#### From an Promise

```typescript
const abortablePromise = AbortablePromise.from(new Promise<string>((resolve) => {
  setTimeout(() => resolve('Operation completed'), 3000);
}));
```

### 2. Aborting an AbortablePromise

#### Abort by the built-in abort() method

```typescript
const abortablePromise = new AbortablePromise<string>((resolve, reject) => {
  setTimeout(() => resolve('Operation completed'), 3000);
});
abortablePromise.abort(); // Abort with default reason
abortablePromise.abort('Custom abort reason'); // Abort with custom reason
```

#### Abort by an external AbortController

```typescript
const controller = new AbortController();
const abortablePromise = new AbortablePromise<string>((resolve, reject) => {
  setTimeout(() => resolve('Operation completed'), 3000);
}, controller.signal);
controller.abort(); // Abort with default reason
controller.abort('Custom abort reason'); // Abort with custom reason
```

### 3. Cooperating with the fetch API

```typescript
interface Data {
  id: number;l
  [key: string]: any;
}
const loadData = (id: number): AbortablePromise<Data> => {
  return AbortablePromise.newWithSignal<Data>((resolve, reject, signal) => {
    fetch(`https://api.example.com/data/${id}`, { signal })
      .then(response => response.json())
      .then(data => resolve(data as Data))
      .catch(reject);
  });
}
const abortablePromise = loadData(123);
setTimeout(() => abortablePromise.abort(), 100);
```

## API Reference

### Class: `AbortablePromise<T>`

`AbortablePromise<T>` is a class that extends the native `Promise<T>` with abort functionality.

#### Constructor

##### `new AbortablePromise<T>(executor, signal?)`

Creates a new AbortablePromise.

- `executor`: `(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, signal: AbortSignal) => void`
- `signal?`: `AbortSignal` (optional)

#### Static Methods

##### `AbortablePromise.new<T>(executor, signal?)`

The same as `new AbortablePromise<T>(executor, signal?)`, just for API design consistency.

##### `AbortablePromise.newWithSignal<T>(executor, signal?)`

Creates a new AbortablePromise with a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.from<T>(promise, signal?)`

Creates a new AbortablePromise from an existing Promise.

##### `AbortablePromise.fromWithSignal<T>(promise, signal?)`

Creates a new AbortablePromise from an existing Promise, with a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.all<T>(values, signal?)`

Similar to `Promise.all()`, but returns an AbortablePromise.

##### `AbortablePromise.allWithSignal<T>(values, signal?)`

Similar to `AbortablePromise.all()`, but creates a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.allSettled<T>(values, signal?)`

Similar to `Promise.allSettled()`, but returns an AbortablePromise.

##### `AbortablePromise.allSettledWithSignal<T>(values, signal?)`

Similar to `AbortablePromise.allSettled()`, but creates a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.any<T>(values, signal?)`

Similar to `Promise.any()`, but returns an AbortablePromise.

##### `AbortablePromise.anyWithSignal<T>(values, signal?)`

Similar to `AbortablePromise.any()`, but creates a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.race<T>(values, signal?)`

Similar to `Promise.race()`, but returns an AbortablePromise.

##### `AbortablePromise.raceWithSignal<T>(values, signal?)`

Similar to `AbortablePromise.race()`, but creates a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.resolve(value?, signal?)`

Creates a new resolved AbortablePromise.

##### `AbortablePromise.resolveWithSignal(value?, signal?)`

Creates a new resolved AbortablePromise, with a new AbortSignalPlus if no signal is provided.

##### `AbortablePromise.reject<T>(reason?)`

Creates a new rejected AbortablePromise.

#### Instance Methods

##### `abort(reason?)`

Aborts the promise with an optional reason.

##### `listen(signal)`

Listens to the provided abort signal.

##### `then<TResult1, TResult2>(onfulfilled?, onrejected?)`

Adds callbacks to the promise. Returns a new AbortablePromise.

##### `catch<TResult>(onrejected?)`

Adds a rejection callback to the promise. Returns a new AbortablePromise.

##### `finally(onfinally?)`

Adds a callback to be executed when the promise is settled. Returns a new AbortablePromise.

#### Notes

- All methods that return a new AbortablePromise propagate the abort functionality through the promise chain.
- The `xxxWithSignal` variants of methods create a new `AbortSignalPlus` if no signal is provided, allowing for easier abort control.

### Helper Classes

#### `AbortError`

A custom class extending `DomException` representing an abort error.

#### `TimeoutError`

A custom class extending `DomException` representing a timeout error.

#### `AbortControllerPlus`

`AbortControllerPlus` implements the `AbortController` interface as the native `AbortController` class does, but will abort with `AbortError` when `abort()` is called without a reason.

#### `AbortSignalPlus`

`AbortSignalPlus` implements the `AbortSignal` interface as the native `AbortSignal` class does, but allows access to the underlying controller from the signal and adds additional features, such as the `one`, `hasTimeout` methods.


### Helper Functions

#### `isAbortError(error: any): boolean`

Checks if the given object is an `AbortError`. Will return `true` for both `AbortError` instances and `DOMException` instances with `name` `AbortError`.

#### `isTimeoutError(error: any): boolean`

Checks if the given object is an `TimeoutError`. Will return `true` for both `TimeoutError` instances and `DOMException` instances with `name` `TimeoutError`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
