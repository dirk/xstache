import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { describe, expect, test } from "vitest";
import parse from "@xstache/parse";

import { compileToString, compileToTemplate } from "./index.js";

describe("compileToTemplate", () => {
    test.for([
        ["attributes", "<div foo={top_level} />", <div foo="baz" />],
        [
            "contents in elements",
            "<span>foo {top_level}</span>",
            <span>foo {"baz"}</span>,
        ],
        [
            "missing contents for value",
            "<span>foo {baz}</span>",
            <span>foo {undefined}</span>,
        ],
        [
            "array contents in section",
            "{#parent.array}{qux}{/parent.array}",
            <>
                {"qux1"}
                {"qux2"}
            </>,
        ],
        [
            "non-array contents in section",
            "foo {#parent.single}{qux}{/parent.single}",
            <>
                {"foo "}
                qux
            </>,
        ],
        [
            "missing contents for section",
            "foo {#missing.child}qux {qux}{/missing.child}",
            <>
                {"foo "}
                {undefined}
            </>,
        ],
        [
            "context climbing in section",
            "bar {#parent.single}{top_level}{/parent.single}",
            <>
                {"bar "}
                baz
            </>,
        ],
    ])("compiles and renders with %s", ([_, input, expected]) => {
        const nodeList = parse(input);
        const template = compileToTemplate(nodeList, jsxRuntime, {
            pretty: true,
        });
        const output = template.render({
            top_level: "baz",
            parent: {
                array: [{ qux: "qux1" }, { qux: "qux2" }],
                single: { qux: "qux" },
            },
        });
        expect(output).toEqual(expected);
    });
});

describe("compileToString", () => {
    test("compiles without pretty-printing", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        expect(compileToString(nodeList, { pretty: false }))
            .toMatchInlineSnapshot(`"function (r, c) {return r.jsx(r.Fragment, {children: [r.jsx("div", {"foo": c.value(["bar"]),"children": ["Hello ", c.value(["name"])]}), r.jsx("input", {})]});}"`);
    });

    test("compiles", () => {
        const nodeList = parse("<div>Hello {name}</div>");
        expect(compileToString(nodeList)).toMatchInlineSnapshot(
            `
          "function (r, c) {
            return r.jsx("div", {
              "children": ["Hello ", c.value(["name"])]
            });
          }"
        `,
        );
    });

    test("compiles to a module", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        expect(compileToString(nodeList, { module: true }))
            .toMatchInlineSnapshot(`
              "import * as jsxRuntime from "react/jsx-runtime";
              import { Template } from "@xstache/jsx-runtime";
              const implementation = function (r, c) {
                return r.jsx(r.Fragment, {
                  children: [r.jsx("div", {
                    "foo": c.value(["bar"]),
                    "children": ["Hello ", c.value(["name"])]
                  }), r.jsx("input", {})]
                });
              };
              export default new Template(implementation, jsxRuntime);
              "
            `);
    });
});
