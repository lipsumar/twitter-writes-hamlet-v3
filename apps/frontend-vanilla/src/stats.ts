import { Stats } from "./types";
import humanDate from "human-date";

function each(selector: string, fn: (el: Element) => void): void {
  document.querySelectorAll(selector).forEach(fn);
}

export function updateStats(stats: Stats) {
  const pcCompleted = (stats.completed / stats.total) * 100;
  each(
    ".stats-complete-completed",
    (el) => (el.innerHTML = stats.completed.toString())
  );
  each(
    ".stats-complete-total",
    (el) => (el.innerHTML = stats.total.toString())
  );

  each(
    ".stats-started-since",
    (el) =>
      (el.innerHTML = stats.startedAt
        ? humanDate.relativeTime(stats.startedAt)
        : "")
  );

  each(
    ".stats-last-tweet-since",
    (el) =>
      (el.innerHTML = stats.lastTweetAt
        ? humanDate.relativeTime(stats.lastTweetAt)
        : "")
  );

  document.body.querySelector(
    "#stats-complete-progress-bar-pc"
  )!.innerHTML = `${pcCompleted.toPrecision(2)}%`;
  document.body.querySelector<HTMLDivElement>(
    "#stats-complete-progress-bar"
  )!.style.width = `${pcCompleted.toPrecision(2)}%`;
}
