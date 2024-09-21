import {
  AbortError,
  isAbortError,
  TimeoutError,
  isTimeoutError,
  AbortControllerPlus,
  AbortSignalPlus,
  AbortablePromise,
} from "../src/index";

describe("Basic APIs", () => {
  it("Create with constructor", async () => {
    expect.assertions(1);

    const abortablePromise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(100), 100);
    });
    expect(abortablePromise).toBeInstanceOf(Promise);
    await abortablePromise;
  });

  it("Create from existing promise", async () => {
    expect.assertions(1);

    const promise = new Promise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const abortablePromise = AbortablePromise.from(promise);
    const anotherAbortablePromise = AbortablePromise.from(abortablePromise);
    expect(anotherAbortablePromise).toBe(abortablePromise);
  });

  it("Abort by abort() method with default reason", async () => {
    expect.assertions(6);
    const abortablePromise = new AbortablePromise<number>((resolve, reject) => {
      setTimeout(() => {
        reject("never goes here");
      }, 100);
      setTimeout(() => {
        resolve(500);
      }, 200);
    })
      .then(
        (value) => {
          expect(value).toEqual("never goes here2");
        },
        (reason) => {
          expect(reason).toBeInstanceOf(DOMException);
          expect(reason.name).toEqual("AbortError");
          expect(reason.message).toEqual("This operation was aborted");
          throw reason;
        },
      )
      .then((value) => {
        expect(value).toEqual("never goes here3");
      });

    setTimeout(() => {
      abortablePromise.abort();
    }, 50);

    try {
      await abortablePromise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
      expect(e.name).toEqual("AbortError");
      expect(e.message).toEqual("This operation was aborted");
    }
  });

  it("Abort by abort() method with custom reason", async () => {
    expect.assertions(1);

    const abortablePromise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });

    setTimeout(() => abortablePromise.abort("I abort it"), 200);

    try {
      await abortablePromise;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Abort by AbortSignal whose signal was passed to constructor() function", async () => {
    expect.assertions(7);

    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();

    const controller = new AbortController();
    const signal = controller.signal;

    const abortablePromise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
      signal.onabort = () => {
        expect(signal.aborted).toBe(true);
        expect(signal.reason).toBeInstanceOf(DOMException);
        mockFn1();
      };
      signal.addEventListener("abort", () => {
        expect(signal.aborted).toBe(true);
        expect(signal.reason).toBeInstanceOf(DOMException);
        mockFn2();
      });
    }, signal);

    setTimeout(() => controller.abort(), 200);

    try {
      await abortablePromise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
    }

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  it("Abort by AbortController whose signal was passed to listen() method", async () => {
    expect.assertions(3);

    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();

    const controller = new AbortController();
    const signal = controller.signal;

    const abortablePromise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
      signal.onabort = () => {
        mockFn1();
      };
      signal.addEventListener("abort", () => {
        mockFn2();
      });
    }).listen(signal);

    setTimeout(() => controller.abort(), 200);

    try {
      await abortablePromise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
    }

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  it("Nest promises", async () => {
    expect.assertions(9);
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const mockFn3 = jest.fn();
    const mockFn4 = jest.fn();
    const mockFn5 = jest.fn();

    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => {
        mockFn1();
        resolve(500);
      }, 1);
    })
      .then((value) => {
        return new AbortablePromise<number>((resolve) => {
          setTimeout(() => {
            mockFn2();
            resolve(value + 100);
          }, 1);
        }).then((value) => {
          expect(value).toEqual(600);
          return new AbortablePromise<number>((_, reject) => {
            setTimeout(() => {
              mockFn3();
              reject("Error Occurred");
            }, 100);
          });
        });
      })
      .then((value) => {
        return new AbortablePromise<number>((resolve) => {
          setTimeout(() => {
            mockFn4();
            resolve(value + 100);
          }, 1);
        });
      })
      .catch((reason) => {
        mockFn5();
        throw reason;
      });

    setTimeout(() => promise.abort(), 50);

    try {
      await promise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
      expect(e.name).toEqual("AbortError");
      expect(e.message).toEqual("This operation was aborted");
    }

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
    expect(mockFn3).toHaveBeenCalledTimes(0);
    expect(mockFn4).toHaveBeenCalledTimes(0);
    expect(mockFn5).toHaveBeenCalledTimes(1);
  });

  it("Cooperating with the fetch API using AbortSignalPlus", async () => {
    expect.assertions(2);
    const downloadPromise = AbortablePromise.newWithSignal<any>(
      (resolve, reject, signal) => {
        signal.onabort = () => {
          reject(new DOMException("This operation was aborted", "AbortError"));
        };
        fetch(
          "https://github.com/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
          { signal },
        )
          .then((response) => response.blob())
          .then((data) => resolve(data))
          .catch((reason) => {
            expect(reason).toBeInstanceOf(AbortError);
            reject(reason);
          });
      },
    );

    setTimeout(() => downloadPromise.abort(), 100);

    try {
      await downloadPromise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
    }
  });

  it("Cooperating with the fetch API using native AbortSignal", async () => {
    expect.assertions(2);

    const controller = new AbortController();
    const signal = controller.signal;
    const downloadPromise = new AbortablePromise<any>(
      (resolve, reject, signal) => {
        fetch(
          "https://github.com/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0-rc.10.zip",
          { signal },
        )
          .then((response) => response.blob())
          .then((data) => resolve(data))
          .catch((reason) => {
            expect(reason).toBeInstanceOf(AbortError);
            reject(reason);
          });
      },
      signal,
    );

    setTimeout(() => downloadPromise.abort(), 100);

    try {
      await downloadPromise;
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException);
    }
  });

  it("Use static timeout method", async () => {
    expect.assertions(9);

    const signal = AbortSignalPlus.timeout(100);

    const promise = new AbortablePromise<void>(() => {}, signal);

    expect(signal.aborted).toBe(false);
    expect(signal.reason).toBeUndefined();

    const mockFn1 = jest.fn();

    setTimeout(() => {
      mockFn1();
      promise.abort();
    }, 1000);

    try {
      await promise;
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e).toBeInstanceOf(DOMException);
      expect(e).toBe(signal.reason);
      expect(signal.aborted).toBe(true);
      expect(e.name).toEqual("TimeoutError");
      expect(e.message).toEqual("The operation was aborted due to timeout");
      expect(mockFn1).toHaveBeenCalledTimes(0);
    }
  });

  it("Use instance timeout method", async () => {
    expect.assertions(9);

    const controller = new AbortControllerPlus();
    const signal = controller.signal;

    const promise = new AbortablePromise<void>(() => {}, signal.timeout(100));

    expect(signal.aborted).toBe(false);
    expect(signal.reason).toBeUndefined();

    const mockFn1 = jest.fn();

    setTimeout(() => {
      mockFn1();
      controller.abort();
    }, 1000);

    try {
      await promise;
    } catch (e) {
      expect(e).toBe(signal.reason);
      expect(signal.aborted).toBe(true);
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e).toBeInstanceOf(DOMException);
      expect(e.name).toEqual("TimeoutError");
      expect(e.message).toEqual("The operation was aborted due to timeout");
      expect(mockFn1).toHaveBeenCalledTimes(0);
    }
  });

  it("Use static any method", async () => {
    expect.assertions(9);

    const controller = new AbortControllerPlus();
    const signal = controller.signal;
    const combinedSignal = AbortSignalPlus.any([
      signal,
      AbortSignal.timeout(100),
      AbortSignalPlus.timeout(100),
    ]);
    const promise = new AbortablePromise<void>(() => {}, combinedSignal);

    expect(combinedSignal.aborted).toBe(false);
    expect(combinedSignal.reason).toBeUndefined();

    const mockFn1 = jest.fn();

    setTimeout(() => {
      mockFn1();
      controller.abort();
    }, 1000);

    try {
      await promise;
    } catch (e) {
      expect(e).toBe(combinedSignal.reason);
      expect(combinedSignal.aborted).toBe(true);
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e).toBeInstanceOf(DOMException);
      expect(e.name).toEqual("TimeoutError");
      expect(e.message).toEqual("The operation was aborted due to timeout");
      expect(mockFn1).toHaveBeenCalledTimes(0);
    }
  });

  it("Use instance any method", async () => {
    expect.assertions(9);

    const controller = new AbortControllerPlus();
    const signal = controller.signal;
    const combinedSignal = signal.any([
      signal,
      AbortSignal.timeout(100),
      AbortSignalPlus.timeout(100),
    ]);
    const promise = new AbortablePromise<void>(() => {}, combinedSignal);

    expect(signal.aborted).toBe(false);
    expect(signal.reason).toBeUndefined();

    const mockFn1 = jest.fn();

    setTimeout(() => {
      mockFn1();
      controller.abort();
    }, 1000);

    try {
      await promise;
    } catch (e) {
      expect(e).toBe(combinedSignal.reason);
      expect(combinedSignal.aborted).toBe(true);
      expect(e).toBeInstanceOf(TimeoutError);
      expect(e).toBeInstanceOf(DOMException);
      expect(e.name).toEqual("TimeoutError");
      expect(e.message).toEqual("The operation was aborted due to timeout");
      expect(mockFn1).toHaveBeenCalledTimes(0);
    }
  });
});

describe("Standard Promise APIs", () => {
  it("promise.then", async () => {
    expect.assertions(7);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 1);
    });
    expect(await promise).toEqual(500);
    const promise2 = promise.then(() => {
      return 200;
    });
    expect(promise2).toBeInstanceOf(AbortablePromise);
    const promise3 = promise2.then(() => {
      return 200;
    });
    expect(promise3).toBeInstanceOf(AbortablePromise);
    const promise4 = promise3
      .then(() => {
        return 200;
      })
      .then(() => {
        return 300;
      });
    expect(promise4).toBeInstanceOf(AbortablePromise);
    expect(await promise2).toEqual(200);
    expect(await promise3).toEqual(200);
    expect(await promise4).toEqual(300);
  });

  it("promise.catch", async () => {
    expect.assertions(4);
    const promise = new AbortablePromise<number>((resolve, reject) => {
      setTimeout(() => {
        reject("throw an error");
      }, 1);
    })
      .catch((reason) => {
        expect(reason).toEqual("throw an error");
        throw reason;
      })
      .then(() => {
        return 200;
      })
      .catch((reason) => {
        expect(reason).toEqual("throw an error");
        throw reason + " again";
      })
      .then(undefined, (reason) => {
        expect(reason).toEqual("throw an error again");
        throw reason + " and again";
      });
    try {
      await promise;
    } catch (e) {
      expect(e).toEqual("throw an error again and again");
    }
  });

  it("promise.finally", async () => {
    expect.assertions(5);
    let token = 0;
    const promise = new AbortablePromise<number>((resolve, reject) => {
      setTimeout(() => {
        reject("throw an error");
      }, 1);
    })
      .catch((reason) => {
        token = 1;
        expect(reason).toEqual("throw an error");
        throw reason;
      })
      .then(() => {
        token = 2;
        return 200;
      })
      .catch((reason) => {
        token = 3;
        expect(reason).toEqual("throw an error");
        throw reason + " again";
      })
      .then(undefined, (reason) => {
        token = 4;
        expect(reason).toEqual("throw an error again");
        throw reason + " and again";
      })
      .finally(() => {
        expect(token).toEqual(4);
      });
    try {
      await promise;
    } catch (e) {
      expect(e).toEqual("throw an error again and again");
    }
  });

  it("Promise.all", async () => {
    expect.assertions(3);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = Promise.resolve(100);
    const promise3 = AbortablePromise.all([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    expect(await promise3).toEqual([500, 100]);

    const promise4 = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise5 = Promise.resolve(100);
    const promise6 = AbortablePromise.all([promise4, promise5]);
    setTimeout(() => promise6.abort("I abort it"), 200);
    try {
      await promise6;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Promise.allSettled", async () => {
    expect.assertions(3);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = Promise.reject("a reason");
    const promise3 = AbortablePromise.allSettled([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    expect(await promise3).toEqual([
      {
        status: "fulfilled",
        value: 500,
      },
      {
        status: "rejected",
        reason: "a reason",
      },
    ]);

    const promise4 = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise5 = Promise.resolve(100);
    const promise6 = AbortablePromise.allSettled([promise4, promise5]);
    setTimeout(() => promise6.abort("I abort it"), 200);
    try {
      await promise6;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Promise.any", async () => {
    expect.assertions(3);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = Promise.resolve(100);
    const promise3 = AbortablePromise.any([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    expect(await promise3).toEqual(100);

    const promise4 = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise5 = new AbortablePromise<number>((_, reject) => {
      setTimeout(() => reject(500), 500);
    });
    const promise6 = AbortablePromise.any([promise4, promise5]);
    setTimeout(() => promise6.abort("I abort it"), 200);
    try {
      await promise6;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Promise.race", async () => {
    expect.assertions(3);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = Promise.resolve(100);
    const promise3 = AbortablePromise.race([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    expect(await promise3).toEqual(100);

    const promise4 = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise5 = new AbortablePromise<number>((_, reject) => {
      setTimeout(() => reject(500), 500);
    });
    const promise6 = AbortablePromise.race([promise4, promise5]);
    setTimeout(() => promise6.abort("I abort it"), 200);
    try {
      await promise6;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Promise.resolve", async () => {
    expect.assertions(4);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = AbortablePromise.resolve(100);
    const promise3 = AbortablePromise.race([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    expect(await promise3).toEqual(100);

    const promise30 = AbortablePromise.resolve();
    expect(await promise30).toEqual(undefined);

    const promise4 = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise5 = new AbortablePromise<number>((_, reject) => {
      setTimeout(() => reject(500), 500);
    });
    const promise6 = AbortablePromise.race([promise4, promise5]);
    setTimeout(() => promise6.abort("I abort it"), 200);
    try {
      await promise6;
    } catch (e) {
      expect(e).toEqual("I abort it");
    }
  });

  it("Promise.reject", async () => {
    expect.assertions(2);
    const promise = new AbortablePromise<number>((resolve) => {
      setTimeout(() => resolve(500), 500);
    });
    const promise2 = AbortablePromise.reject("a reason");
    const promise3 = AbortablePromise.race([promise, promise2]);
    expect(promise3).toBeInstanceOf(AbortablePromise);
    try {
      await promise3;
    } catch (e) {
      expect(e).toEqual("a reason");
    }
  });
});

describe("AbortError", () => {
  it("Construct with default message", () => {
    const error = new AbortError();
    expect(error.name).toEqual("AbortError");
    expect(error.message).toEqual("This operation was aborted");
  });

  it("Construct with custom message", () => {
    const error = new AbortError("I abort it");
    expect(error.name).toEqual("AbortError");
    expect(error.message).toEqual("I abort it");
  });

  it("isAbortError", () => {
    const error = new AbortError("I abort it");
    expect(error.message).toEqual("I abort it");
    expect(isAbortError(error)).toBe(true);
    const exception = new DOMException("I abort it", "AbortError");
    expect(isAbortError(exception)).toBe(true);
  });
});

describe("TimeoutError", () => {
  it("Construct with default message", () => {
    const error = new TimeoutError();
    expect(error.name).toEqual("TimeoutError");
    expect(error.message).toEqual("The operation was aborted due to timeout");
  });

  it("Construct with custom message", () => {
    const error = new TimeoutError("Timeout");
    expect(error.name).toEqual("TimeoutError");
    expect(error.message).toEqual("Timeout");
  });

  it("isTimeoutError", () => {
    const error = new TimeoutError("Timeout");
    expect(error.message).toEqual("Timeout");
    expect(isTimeoutError(error)).toBe(true);
    const exception = new DOMException("Timeout", "TimeoutError");
    expect(isTimeoutError(exception)).toBe(true);
  });
});
