import invariant from "tiny-invariant";
import { Entry, TextContent } from "types";
import { element, renderTextContent } from "./lib";
import TweetHover from "./TweetHover";

type CurrentWord = {
  id: number;
  entry_index: number;
};

export default class App {
  el: HTMLDivElement;
  entries: Entry[] = [];
  currentWord: CurrentWord | null = null;
  stats: { total: number; completed: number } = { total: 0, completed: 0 };

  constructor(el: HTMLDivElement) {
    this.el = el;
    new TweetHover(el);
    fetch(`${import.meta.env.VITE_API_URL}/init`)
      .then((resp) => resp.json())
      .then((initData) => {
        this.entries = initData.entries;
        this.currentWord = initData.currentWord;
        this.stats = initData.stats;
        this.build();
        this.scrollToBottom();
        this.listenToEvents();
      });
  }

  build() {
    this.entries.forEach((entry) => {
      this.appendEntry(entry);
    });

    // @todo for the love of god let's pull this in another module
    const pcCompleted = (this.stats.completed / this.stats.total) * 100;
    document.body.querySelector("#stats-complete-completed")!.innerHTML =
      this.stats.completed.toString();
    document.body.querySelector("#stats-complete-total")!.innerHTML =
      this.stats.total.toString();
    document.body.querySelector(
      "#stats-complete-progress-bar-pc"
    )!.innerHTML = `${pcCompleted.toPrecision(2)}%`;
    document.body.querySelector<HTMLDivElement>(
      "#stats-complete-progress-bar"
    )!.style.width = `${pcCompleted.toPrecision(2)}%`;
  }

  appendEntry(entry: Entry): void {
    const entryEl = document.createElement("div");
    entryEl.classList.add("entry", `entry--${entry.type}`);

    entryEl.appendChild(
      element(
        "div",
        { class: "entry__text" },
        this.buildTextContent(entry.text)
      )
    );

    this.el.appendChild(entryEl);
  }

  buildTextContent(textContent: TextContent): string {
    const html = renderTextContent(textContent, this.currentWord!.id);
    return html;
  }

  fetchEntry(entryIndex: number): Promise<Entry> {
    return fetch(`${import.meta.env.VITE_API_URL}/entry/` + entryIndex).then(
      (resp) => resp.json()
    );
  }

  listenToEvents() {
    const source = new EventSource(`${import.meta.env.VITE_API_URL}/events`);
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

    const currentEntry = this.entries.find(
      (e) => e.index === this.currentWord!.entry_index
    );
    invariant(typeof currentEntry !== "undefined");
    const textContent = currentEntry.text;
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
