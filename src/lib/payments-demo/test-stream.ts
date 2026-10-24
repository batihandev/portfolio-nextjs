import type { DemoStream } from "./client";

type Listener = (event: MessageEvent) => void;

/** A stand-in for EventSource that tests open, drop and feed by hand. */
export class FakeStream {
  static opened: FakeStream[] = [];
  readyState = 0;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: Listener | null = null;
  closed = false;
  private listeners = new Map<string, Listener[]>();
  constructor(readonly url: string) {
    FakeStream.opened.push(this);
  }
  static create = (url: string) => new FakeStream(url) as unknown as DemoStream;
  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  close() {
    this.closed = true;
    this.readyState = 2;
  }
  open() {
    this.readyState = 1;
    this.onopen?.(new Event("open"));
  }
  /** The browser lost the connection and will reconnect by itself. */
  drop() {
    this.readyState = 0;
    this.onerror?.(new Event("error"));
  }
  /** The browser gave up, as it does when the server refuses the stream. */
  fail() {
    this.readyState = 2;
    this.onerror?.(new Event("error"));
  }
  send(data: unknown, type?: string) {
    const event = new MessageEvent(type ?? "message", {
      data: typeof data === "string" ? data : JSON.stringify(data),
    });
    if (type) for (const listener of this.listeners.get(type) ?? []) listener(event);
    else this.onmessage?.(event);
  }
}
