import { describe, expect, test } from "vitest";
import { render } from "./utils";

describe("test/utils", () => {
  test("dom works", () => {
    const { getByText } = render("<b>hoho</b>");
    expect(getByText("hoho").tagName).toBe("B");
  });
  test("getBySelector", () => {
    const { getBySelector } = render(
      '<div id="foo">foo</div><div id="bar">bar</div>'
    );
    expect(getBySelector("#foo")?.innerHTML).toBe("foo");
    expect(getBySelector("#bar")?.innerHTML).toBe("bar");
  });
});
