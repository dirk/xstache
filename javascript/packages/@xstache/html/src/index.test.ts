import { describe, expect, test } from "vitest";
import parse from "@xstache/parse";

import { compileToString, compileToTemplate } from "./index.js";

describe("compileToString", () => {
    test("compiles", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        expect(compileToString(nodeList)).toMatchInlineSnapshot(`
          "function (c, b) {
            c.element("div", {
              "foo": c.value(["bar"])
            }, () => {
              b.push("Hello ");
              b.push(c.value(["name"]));
            }, b);
            c.element("input", {}, undefined, b);
          }"
        `);
    });
});

describe("compileToTemplate", () => {
    test("compiles and renders", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        const template = compileToTemplate(nodeList);
        expect(
            template.render({
                bar: "baz",
                name: "world",
            }),
        ).toMatchInlineSnapshot(`"<div foo="baz">Hello world</div><input />"`);
    });
});
