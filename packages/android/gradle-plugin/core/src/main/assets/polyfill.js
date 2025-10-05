; (function () {
  globalThis.process = new class Process {

    #env = {};
    #argv = [];

    get env() {
      return this.#env;
    }

    get argv() {
      return this.#argv;
    }

  }

  globalThis.Event = class Event {
    constructor(type, options) {
      this.type = type;
      this.target = null;
      this.currentTarget = null;
      this.eventPhase = 0;
      this.bubbles = options?.bubbles || false;
      this.cancelable = options?.cancelable || false;
    }
    stopPropagation() {
      this.eventPhase = 1;
    }
    preventDefault() {
      if (this.cancelable) {
        this.defaultPrevented = true;
      }
    }
  }

  globalThis.EventTarget = class EventTarget {
    #listeners;
    constructor() {
      this.#listeners = {};
    }
    addEventListener(type, listener) {
      if (!this.#listeners[type]) {
        this.#listeners[type] = [];
      }
      this.#listeners[type].push(listener);
    }
    removeEventListener(type, listener) {
      if (!this.#listeners[type]) return;
      this.#listeners[type] = this.#listeners[type].filter(l => l !== listener);
    }
    dispatchEvent(event) {
      if (!this.#listeners[event.type]) return;
      for (const listener of this.#listeners[event.type]) {
        listener(event);
      }
    }
  }

  globalThis.AbortSignal = class AbortSignal extends EventTarget {
    #aborted;
    #onabort;
    constructor() {
      super();
      this.#aborted = false;
    }
    get aborted() {
      return this.#aborted;
    }
    get onabort() {
      return this.#onabort;
    }
    set onabort(listener) {
      const existing = this.#onabort;
      if (existing) {
        this.removeEventListener("abort", existing);
      }
      this.#onabort = callback;
      this.addEventListener("abort", callback);
    }
  }

  globalThis.AbortController = class AbortController {
    #signal;
    constructor() {
      this.#signal = new AbortSignal();
    }
    get signal() {
      return this.#signal;
    }
    abort() {
      const signal = this.signal;
      if (!signal.aborted) {
        signal._aborted = true;
        signal.dispatchEvent(new Event("abort"));
      }
    }
  }

  globalThis.crypto = new class Crypto {
    randomUUID() {
      return __NATIVE_BRIDGE__.crypto.randomUUID();
    }
    randomBytes(length) {
      if (!Number.isSafeInteger(length) || length < 0) {
        throw Error('Invalid length');
      }
      return __NATIVE_BRIDGE__.crypto.randomBytes(length);
    }
  }
})();