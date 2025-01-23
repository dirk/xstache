import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { describe, expect, test } from "vitest";
import parse from "@xstache/parse";

import { compileToString, compileToTemplate } from "./index.js";

describe("compileToTemplate", () => {
    test.for([
        ["attributes", "<div foo={bar} />", <div foo="baz" />],
        [
            "contents in elements",
            "<span>foo {bar}</span>",
            <span>foo {"baz"}</span>,
        ],
        [
            "missing contents for elements",
            "<span>foo {baz}</span>",
            <span>foo {undefined}</span>,
        ],
    ])("compiles and renders with %s", ([_, input, expected]) => {
        const nodeList = parse(input);
        const template = compileToTemplate(nodeList, { pretty: true });
        const output = template.render(jsxRuntime, { bar: "baz" });
        expect(output).toEqual(expected);
    });
});

describe("compileToString", () => {
    test("compiles", () => {
        const nodeList = parse("<div>Hello {name}</div>");
        expect(compileToString(nodeList)).toMatchInlineSnapshot(
            `"{xs: function (r, c) {return r.jsx("div", {"children": ["Hello ", c.v("name")]});}}"`,
        );
    });

    test("compiles with pretty-printing", () => {
        const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
        expect(compileToString(nodeList, { pretty: true }))
            .toMatchInlineSnapshot(`
        "{
          xs: function (r, c) {
            return [r.jsx("div", {
              "foo": c.v("bar"),
              "children": ["Hello ", c.v("name")]
            }), r.jsx("input", {})];
          }
        }"
      `);
    });
});
