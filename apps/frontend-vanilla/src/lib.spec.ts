import { describe, test, expect } from "vitest";
import { elementString, renderTextContent } from "./lib";

describe("elementString", () => {
  test("<span></span>", () => {
    expect(elementString("span")).toBe("<span></span>");
  });
  test('<span foo="bar"></span>', () => {
    expect(elementString("span", { foo: "bar" })).toBe(
      '<span foo="bar"></span>'
    );
  });
  test('<span foo="bar" bar="baz"></span>', () => {
    expect(elementString("span", { foo: "bar", bar: "baz" })).toBe(
      '<span foo="bar" bar="baz"></span>'
    );
  });
  test("className string", () => {
    expect(elementString("span", { className: "hey" })).toBe(
      '<span class="hey"></span>'
    );
  });
  test("className string[]", () => {
    expect(elementString("span", { className: ["hey", "dude"] })).toBe(
      '<span class="hey dude"></span>'
    );
  });
  test("className {}", () => {
    expect(elementString("span", { className: { yes: true, no: false } })).toBe(
      '<span class="yes"></span>'
    );
  });
});

describe("renderTextContent", () => {
  test("hello world", () => {
    const html = renderTextContent(
      {
        raw: "hello world",
        words: [
          {
            index: 1,
            token: "hello",
            tweetId: "123",
          },
          {
            index: 2,
            token: "world",
            tweetId: "123",
          },
        ],
      },
      99
    );

    expect(html).toEqual(
      [
        '<span data-id="1" class="visible">hello</span>',
        '<span data-id="2-prev" class="visible"> </span>',
        '<span data-id="2" class="visible">world</span>',
      ].join("")
    );
  });
  test("-hello world", () => {
    const html = renderTextContent(
      {
        raw: "-hello world",
        words: [
          {
            index: 1,
            token: "hello",
            tweetId: "123",
          },
          {
            index: 2,
            token: "world",
            tweetId: "123",
          },
        ],
      },
      99
    );
    expect(html).toEqual(
      [
        '<span data-id="1-prev" class="visible">-</span>',
        '<span data-id="1" class="visible">hello</span>',
        '<span data-id="2-prev" class="visible"> </span>',
        '<span data-id="2" class="visible">world</span>',
      ].join("")
    );
  });
  test("hello world!", () => {
    const html = renderTextContent(
      {
        raw: "hello world!",
        words: [
          {
            index: 1,
            token: "hello",
            tweetId: "123",
          },
          {
            index: 2,
            token: "world",
            tweetId: "123",
          },
        ],
      },
      99
    );
    expect(html).toEqual(
      [
        '<span data-id="1" class="visible">hello</span>',
        '<span data-id="2-prev" class="visible"> </span>',
        '<span data-id="2" class="visible">world</span>',
        '<span data-id="2-next" class="visible">!</span>',
      ].join("")
    );
  });
  test("hello world, current:world", () => {
    const html = renderTextContent(
      {
        raw: "hello world",
        words: [
          {
            index: 1,
            token: "hello",
            tweetId: "123",
          },
          {
            index: 2,
            token: "world",
            tweetId: null,
          },
        ],
      },
      2
    );

    expect(html).toEqual(
      [
        '<span data-id="1" class="visible">hello</span>',
        '<span data-id="2-prev" class="visible"> </span>',
        '<span data-id="2" class="current">world</span>',
      ].join("")
    );
  });
  test("hello, dear world!, current:world", () => {
    const html = renderTextContent(
      {
        raw: "hello, dear world!",
        words: [
          {
            index: 1,
            token: "hello",
            tweetId: "123",
          },
          {
            index: 2,
            token: "dear",
            tweetId: "123",
          },
          {
            index: 3,
            token: "world",
            tweetId: null,
          },
        ],
      },
      3
    );
    expect(html).toEqual(
      [
        '<span data-id="1" class="visible">hello</span>',
        '<span data-id="2-prev" class="visible">, </span>',
        '<span data-id="2" class="visible">dear</span>',
        '<span data-id="3-prev" class="visible"> </span>',
        '<span data-id="3" class="current">world</span>',
        '<span data-id="3-next">!</span>',
      ].join("")
    );
  });
});
