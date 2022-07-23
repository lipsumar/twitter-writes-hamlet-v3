import { LiveTextContent } from "types";

type Attributes = Record<string, any>;

function attrsToString(attrs: Attributes): string {
  return Object.entries(attrs)
    .map(([key, value]) => {
      const attr = key === "className" ? "class" : key;
      if (key === "className" && Array.isArray(value)) {
        return `class="${value.join(" ")}"`;
      }
      if (key === "className" && typeof value === "object") {
        const val = Object.entries(value as Record<string, boolean>)
          .filter(([, v]) => !!v)
          .map(([k]) => k)
          .join(" ");
        if (!val) return false;
        return `class="${val}"`;
      }
      return `${attr}="${value}"`;
    })
    .filter(Boolean)
    .join(" ");
}
export function elementString(
  tagName: string,
  attrs: Attributes = {},
  innerHTML: string = ""
) {
  const attrsString = attrsToString(attrs);
  return `<${tagName}${
    attrsString ? " " + attrsString : ""
  }>${innerHTML}</${tagName}>`;
}

export function renderTextContent(
  textContent: LiveTextContent,
  currentWordIndex: number
): string {
  const { words, raw } = textContent;
  let rawIndex = 0;
  let lastTokenIsVisible = false;
  let lastId = 0;
  //let previousWord: LiveWord | null = null;
  let html = words
    .flatMap((word) => {
      // if (!word.tweetId && previousWord && !previousWord.tweetId) {
      //   previousWord = word;
      //   return null;
      // }
      const wordIndex = raw.indexOf(word.token, rawIndex);
      let spacerToken = null;

      if (wordIndex !== rawIndex) {
        // there is something before next word
        spacerToken = elementString(
          "span",
          {
            "data-id": `${word.index}-prev`,
            className: { visible: word.index <= currentWordIndex },
          },
          raw.substring(rawIndex, wordIndex)
        );
      }
      rawIndex = wordIndex + word.token.length;
      const visible = word.index < currentWordIndex;
      const token = elementString(
        "span",
        {
          "data-id": word.index,
          className: {
            visible,
            current: word.index === currentWordIndex,
          },
        },
        word.token
      );
      lastId = word.index;
      lastTokenIsVisible = visible;
      //previousWord = word;

      if (spacerToken) {
        return [spacerToken, token];
      }
      return token;
    })
    .join("");

  if (rawIndex < raw.length) {
    html += elementString(
      "span",
      {
        "data-id": `${lastId}-next`,
        className: { visible: lastTokenIsVisible },
      },
      raw.substring(rawIndex)
    );
  }
  return html;
}
