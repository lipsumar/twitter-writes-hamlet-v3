import { beforeAll, describe, expect, test, vi } from "vitest";
import App from "./App";
import {
  mockEventSource,
  emitEventSourceMessage,
  mockFetch,
  render,
} from "./test/utils";
import entries from "./test/entries.json";
import { waitFor } from "@testing-library/dom";

describe("App", () => {
  beforeAll(() => {
    mockEventSource();
  });

  test("render app", async () => {
    const { getBySelector } = render('<div id="app"></div>');
    mockFetch("http://localhost:5000/init", {
      entries,
      currentWord: {
        id: 1,
        entry_index: 1,
        entry_field: "text",
      },
    });

    const app = new App(getBySelector<HTMLDivElement>("#app")!);

    await waitFor(() => {
      expect(app.el.innerHTML).not.toBe("");
    });

    const word1El = getBySelector('[data-id="1"]')!;
    expect(word1El.innerHTML).toBe("The");
    expect(word1El.className).toBe("current");
  });

  describe("running through first entry", () => {
    let app: App;

    test("init", async () => {
      const { getBySelector } = render('<div id="app"></div>');
      mockFetch("http://localhost:5000/init", {
        entries,
        currentWord: {
          id: 1,
          entry_index: 1,
          entry_field: "text",
        },
      });
      mockFetch("http://localhost:5000/entry/2", entries[1]);

      app = new App(getBySelector<HTMLDivElement>("#app")!);

      await waitFor(() => {
        expect(app.el.innerHTML).not.toBe("");
      });
    });

    describe("words coming in", () => {
      const emit = emitEventSourceMessage.bind(
        null,
        "http://localhost:5000/events"
      );

      test("the", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[0].innerHTML).toBe("The");
        expect(wordEls[0].className).toBe("current");
        emit({
          currentWord: {
            id: 2,
            entry_index: 1,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[0].className).toBe("visible");
        });
      });
      test("tragedy", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[2].innerHTML).toBe("Tragedy");
        expect(wordEls[2].className).toBe("current");
        emit({
          currentWord: {
            id: 3,
            entry_index: 1,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[2].className).toBe("visible");
        });
      });
      test("of", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[4].innerHTML).toBe("of");
        expect(wordEls[4].className).toBe("current");
        emit({
          currentWord: {
            id: 4,
            entry_index: 1,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[4].className).toBe("visible");
        });
      });
      test("Hamlet", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[6].innerHTML).toBe("Hamlet");
        expect(wordEls[6].className).toBe("current");
        expect(wordEls[7].innerHTML).toBe(", ");
        expect(wordEls[7].className).toBe("");
        emit({
          currentWord: {
            id: 5,
            entry_index: 1,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[6].className).toBe("visible");
          expect(wordEls[7].className).toBe("visible");
        });
      });
      test("Prince", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[8].innerHTML).toBe("Prince");
        expect(wordEls[8].className).toBe("current");

        emit({
          currentWord: {
            id: 6,
            entry_index: 1,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[8].className).toBe("visible");
        });
      });
    });
  });

  describe('running through "!hola, que tal!"', () => {
    let app: App;

    test("init", async () => {
      const { getBySelector } = render('<div id="app"></div>');
      mockFetch("http://localhost:5000/init", {
        entries,
        currentWord: {
          id: 12,
          entry_index: 3,
          entry_field: "text",
        },
      });
      mockFetch("http://localhost:5000/entry/4", entries[1]);

      app = new App(getBySelector<HTMLDivElement>("#app")!);

      await waitFor(() => {
        expect(app.el.innerHTML).not.toBe("");
      });
    });

    describe("words coming in", () => {
      const emit = emitEventSourceMessage.bind(
        null,
        "http://localhost:5000/events"
      );

      test("hola", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[21].innerHTML).toBe("hola");
        expect(wordEls[21].className).toBe("current");
        expect(wordEls[20].innerHTML).toBe("¡");
        expect(wordEls[20].className).toBe("visible");
        expect(wordEls[22].innerHTML).toBe(", ");
        expect(wordEls[22].className).toBe("");
        emit({
          currentWord: {
            id: 13,
            entry_index: 3,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[21].className).toBe("visible");
          expect(wordEls[22].className).toBe("visible");
        });
      });
      test("que", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[23].innerHTML).toBe("que");
        expect(wordEls[23].className).toBe("current");

        emit({
          currentWord: {
            id: 14,
            entry_index: 3,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[23].className).toBe("visible");
        });
      });
      test("tal", async () => {
        const wordEls = app.el.querySelectorAll("span");
        expect(wordEls[25].innerHTML).toBe("tal");
        expect(wordEls[25].className).toBe("current");
        expect(wordEls[26].innerHTML).toBe("!");
        expect(wordEls[26].className).toBe("");

        emit({
          currentWord: {
            id: 15,
            entry_index: 3,
            entry_field: "text",
          },
        });
        await waitFor(() => {
          expect(wordEls[25].className).toBe("visible");
          expect(wordEls[26].className).toBe("visible");
        });
      });
    });
  });
});
