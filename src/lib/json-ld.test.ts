import { describe, expect, it } from "vitest";
import { jsonLd } from "./json-ld";

describe("jsonLd", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const out = jsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("still parses back to the same value", () => {
    const value = { name: "a < b", list: [1, "<x>"] };
    expect(JSON.parse(jsonLd(value))).toEqual(value);
  });
});
