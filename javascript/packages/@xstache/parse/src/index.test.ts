import { expect, test } from "vitest";
import parse from "./index.js";

test("parse", () => {
    expect(parse("<div>hello<span> world</span></div>")).toMatchInlineSnapshot(`
      {
        "children": {
          "children": [
            {
              "raw": "hello",
              "type": "TextNode",
            },
            {
              "children": {
                "raw": " world",
                "type": "TextNode",
              },
              "closing": {
                "name": {
                  "name": "span",
                  "type": "IdentifierNode",
                },
                "type": "ElementClosingNode",
              },
              "opening": {
                "name": {
                  "name": "span",
                  "type": "IdentifierNode",
                },
                "selfClosing": false,
                "type": "ElementOpeningNode",
              },
              "type": "ElementNode",
            },
          ],
          "closing": {
            "name": {
              "name": "div",
              "type": "IdentifierNode",
            },
            "type": "ElementClosingNode",
          },
          "opening": {
            "name": {
              "name": "div",
              "type": "IdentifierNode",
            },
            "selfClosing": false,
            "type": "ElementOpeningNode",
          },
          "type": "ElementNode",
        },
        "type": "NodeList",
      }
    `);
});
