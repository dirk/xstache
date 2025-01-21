import { describe, expect, test } from "vitest";
import parse from "@xstache/parse";

import { compileToString } from "./index.js";

// describe("compileToTemplate", () => {
//     test("compiles", () => {
//         const nodeList = parse("<div foo={bar}>Hello {name}</div>\n<input />");
//         console.log(compileToTemplate(nodeList));
//     });
// });

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
