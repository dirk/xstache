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

    test("section", () => {
        const nodeList = parse("{#foo}Hello{/foo}");
        expect(compileToString(nodeList)).toMatchInlineSnapshot(`
          "function (c, b) {
            c.section(["foo"], c => {
              b.push("Hello");
            });
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

    test("section as repetition", () => {
        const nodeList = parse("{#foo}Hello {bar}.\n{/foo}");
        const template = compileToTemplate(nodeList);
        expect(
            template.render({
                foo: [{ bar: "baz" }, { bar: "qux" }],
            }),
        ).toMatchInlineSnapshot(`
          "Hello baz.
          Hello qux.
          "
        `);
        // Testing without repetition too.
        expect(
            template.render({
                foo: { bar: "baz" },
            }),
        ).toMatchInlineSnapshot(`
          "Hello baz.
          "
        `);
    });
});
