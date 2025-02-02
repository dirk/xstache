import { describe, expect, test } from "vitest";
import parse from "@xstache/parse";

import { compileToString } from "./index.js";

describe("compileToString", () => {
    test("compiles", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        expect(compileToString(nodeList)).toMatchInlineSnapshot(`
          "function (c, b) {
            c.element("div", {
              "foo": c.value(["bar"])
            }, (c, b) => {
              b.push("Hello ");
              b.push(c.value(["name"]));
            }, b);
            c.element("input", {}, (c, b) => {}, b);
          }"
        `);
    });
});
