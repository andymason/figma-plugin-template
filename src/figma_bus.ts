interface Message {
  instanceId: string;
  eventName: string;
  data?: string | Uint8Array;
}

interface FigmaMessage {
  pluginMessage: Message;
}

type Listener = {
  eventName: string;
  callback: Function;
  once: boolean;
};

type Options = {
  instanceId?: string;
};

export class FigmaBus {
  #instanceId: string = "figmaBus";
  #destroyed: boolean = false;
  #pool: Listener[] = [];

  constructor(options?: Options) {
    this.#instanceId = options?.instanceId ?? this.#instanceId;

    if (typeof figma === "undefined") {
      window.addEventListener("message", this.#handlePostMessage);
    } else {
      figma.ui.on("message", this.#handlePostMessage);
    }
  }

  #isValidResponseMessage = (event: MessageEvent<FigmaMessage> | Message) => {
    if ("origin" in event) {
      return event.data.pluginMessage?.instanceId === this.#instanceId;
    } else {
      return event.instanceId === this.#instanceId;
    }
  };

  #handlePostMessage = (event: MessageEvent<FigmaMessage> | Message) => {
    if (!this.#isValidResponseMessage(event)) {
      return;
    }

    const { eventName, data } =
      "origin" in event ? event.data.pluginMessage : event;

    for (const listener of this.#pool) {
      if (listener.eventName === eventName) {
        listener.callback(data);

        if (listener.once) {
          this.off(listener.eventName, listener.callback);
        }
      }
    }
  };

  #isUniqueListener(eventName: string, callback: Function): boolean {
    return !this.#pool.some((listener) => {
      return listener.eventName === eventName && listener.callback === callback;
    });
  }

  public emit = (eventName: string, data?: any) => {
    const message: Message = {
      instanceId: this.#instanceId,
      eventName,
      data,
    };

    if (typeof figma === "undefined") {
      window.parent.postMessage({ pluginMessage: message }, "*");
    } else {
      figma.ui.postMessage(message);
    }
  };

  public emitPromise = (eventName: string, data?: any): Promise<any> => {
    return new Promise((resolve, _reject) => {
      this.on(eventName, resolve, true);
      this.emit(eventName, data);
    });
  };

  public on = (eventName: string, callback: Function, once = false): void => {
    if (this.#destroyed) {
      return;
    }

    if (!this.#isUniqueListener(eventName, callback)) {
      return;
    }

    const listener: Listener = {
      eventName,
      callback: callback,
      once,
    };

    this.#pool.push(listener);
  };

  public off(eventName: string, fn: Function): void {
    if (this.#destroyed) {
      return;
    }

    const listenerIndex = this.#pool.findIndex((event) => {
      return event.eventName === eventName && event.callback === fn;
    });

    if (listenerIndex === -1) {
      return;
    }

    this.#pool.splice(listenerIndex, 1);
  }

  public tearDown(): void {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;

    if (typeof figma === "undefined") {
      window.removeEventListener("message", this.#handlePostMessage);
    } else {
      figma.ui.off("message", this.#handlePostMessage);
    }

    this.#pool = [];
  }
}
