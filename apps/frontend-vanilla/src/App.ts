import invariant from "tiny-invariant";
import { Entry, LiveTextContent, LiveWord } from "types";
import { renderTextContent } from "./lib";

function element(tagName: string, html: string): HTMLElement {
  const el = document.createElement(tagName);
  el.innerHTML = html;
  return el;
}

type CurrentWord = {
  id: number;
  entry_index: number;
  entry_field: "text" | "name" | "direction";
};

export default class App {
  el: HTMLDivElement;
  entries: Entry<LiveTextContent>[] = [];
  currentWord: CurrentWord | null = null;

  constructor(el: HTMLDivElement) {
    this.el = el;
    fetch("http://localhost:5000/init")
      .then((resp) => resp.json())
      .then((initData) => {
        this.entries = initData.entries;
        this.currentWord = initData.currentWord;
        this.build();
        this.scrollToBottom();
        this.listenToEvents();
      });
  }

  build() {
    this.entries.forEach((entry) => {
      this.appendEntry(entry);
    });
  }

  appendEntry(entry: Entry<LiveTextContent>): void {
    const entryEl = document.createElement("div");
    entryEl.classList.add("entry", `entry--${entry.type}`);

    if ("name" in entry) {
      entryEl.appendChild(element("div", this.buildTextContent(entry.name)));
      if (entry.direction) {
        entryEl.appendChild(
          element("div", this.buildTextContent(entry.direction))
        );
      }
    }
    entryEl.appendChild(element("div", this.buildTextContent(entry.text)));

    this.el.appendChild(entryEl);
  }

  buildTextContent(textContent: LiveTextContent): string {
    const html = renderTextContent(textContent, this.currentWord!.id);
    return html;
  }

  fetchEntry(entryIndex: number): Promise<Entry<LiveTextContent>> {
    return fetch("http://localhost:5000/entry/" + entryIndex).then((resp) =>
      resp.json()
    );
  }

  listenToEvents() {
    const source = new EventSource("http://localhost:5000/events");
    source.onmessage = (e) => {
      this.onServerEvent(e);
    };
  }

  onServerEvent(e: MessageEvent) {
    if (e.data === '"hello"') {
      return;
    }

    const data = JSON.parse(e.data);
    // @todo validate we're up to date

    this.updateCurrentWord(data.currentWord);

    const lastEntry = this.entries.at(-1);
    if (this.currentWord!.entry_index === lastEntry!.index) {
      console.log("fetch more entry");
      this.fetchEntry(lastEntry!.index + 1).then((entry) => {
        this.entries.push(entry);
        this.appendEntry(entry);
      });
    }

    // if (this.isScrolledToBottom()) {
    //   this.scrollToBottom();
    // }
  }

  updateCurrentWord(newCurrentWord: CurrentWord): void {
    this.el
      .querySelector(`span[data-id="${this.currentWord!.id}"]`)
      ?.classList.remove("current");
    this.el
      .querySelector(`span[data-id="${this.currentWord!.id}"]`)
      ?.classList.add("visible");
    // this.el
    //   .querySelector(`span[data-id="${this.currentWord!.id}-prev"]`)
    //   ?.classList.add("visible");

    const currentEntry = this.entries.find(
      (e) => e.index === this.currentWord!.entry_index
    );
    invariant(typeof currentEntry !== "undefined");
    const textContent = (currentEntry as any)[
      this.currentWord!.entry_field
    ] as LiveTextContent;
    const isLastWordOfEntry =
      textContent.words.map((w) => w.index).indexOf(this.currentWord!.id) ===
      textContent.words.length - 1;

    if (isLastWordOfEntry) {
      this.el
        .querySelector(`span[data-id="${this.currentWord!.id}-next"]`)
        ?.classList.add("visible");
    }

    this.el
      .querySelector(`span[data-id="${newCurrentWord.id}-prev"]`)
      ?.classList.add("visible");
    this.el
      .querySelector(`span[data-id="${newCurrentWord.id}"]`)
      ?.classList.add("current");
    this.currentWord = newCurrentWord;
  }

  scrollToBottom() {
    this.el.scrollTop = this.el.scrollHeight;
  }

  isScrolledToBottom() {
    const delta = Math.abs(
      this.el.scrollHeight - this.el.offsetHeight - this.el.scrollTop
    );
    return delta < 50;
  }
}
