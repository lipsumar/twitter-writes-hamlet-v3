import { element, getCoords } from "./lib";

export default class TweetHover {
  el: HTMLDivElement;
  tweetBodyEl: HTMLDivElement;

  constructor(el: HTMLDivElement) {
    this.el = el;
    this.tweetBodyEl = element<HTMLDivElement>("div", {
      class: "tweet-tooltip font-sans",
    });
    this.build();

    el.addEventListener("mouseover", (e) => {
      if (!e.target) return;
      const target = e.target as HTMLElement;
      if (target.tagName !== "SPAN") return;
      const wordId = target.getAttribute("data-id");
      if (!wordId || wordId?.includes("-")) return;
      if (!target.classList.contains("visible")) return;

      this.showTweet(parseInt(wordId, 10), target);
    });
  }

  build() {
    this.el.appendChild(this.tweetBodyEl);
  }

  showTweet(wordId: number, span: HTMLSpanElement) {
    this.place(span);
    this.show();
    this.setLoading();
    this.fetchTweet(wordId).then((tweet) => {
      this.setTweet(tweet);
    });
  }

  fetchTweet(wordId: number) {
    return fetch(`${import.meta.env.VITE_API_URL}/tweet/${wordId}`).then(
      (resp) => resp.json()
    );
  }

  setTweet(tweet: any) {
    const date = new Date(tweet.created_at);
    this.tweetBodyEl.innerHTML = `<b>@${
      tweet.user.screen_name
    }</b> <span class="text-xs">${date.toLocaleString()}</span><br/>${
      tweet.text
    }`;
  }

  place(span: HTMLSpanElement) {
    const bbox = getCoords(span);
    this.tweetBodyEl.style.top = `${bbox.top + bbox.height}px`;
    this.tweetBodyEl.style.left = `${bbox.left}px`;
  }

  setLoading() {
    this.tweetBodyEl.innerHTML = "Loading...";
  }

  show() {
    this.tweetBodyEl.style.display = "block";
  }

  hide() {
    this.tweetBodyEl.style.display = "none";
  }
}
