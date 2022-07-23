import { getByText } from "@testing-library/dom";
import { vi } from "vitest";

export function render(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return {
    container,
    getByText: getByText.bind(null, container),
    getBySelector: <T extends Element>(selector: string) =>
      container.querySelector<T>(selector),
    debug: () => console.log(container.innerHTML),
  };
}

const mockFetches: Record<string, string> = {};
export function mockFetch(url: string, body: string | any) {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  mockFetches[url] = bodyStr;
  vi.stubGlobal("fetch", (url: string) => {
    return Promise.resolve(new Response(mockFetches[url]));
  });
}

export const eventSources: Record<string, any> = {};
export function mockEventSource() {
  function EventSourceMock(this: any, url: string) {
    eventSources[url] = this;
  }
  vi.stubGlobal("EventSource", EventSourceMock);
}
export function emitEventSourceMessage(url: string, messageBody: string | any) {
  eventSources[url]!.onmessage(
    new MessageEvent("foo", {
      data:
        typeof messageBody === "string"
          ? messageBody
          : JSON.stringify(messageBody),
    })
  );
}
