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
                "attributes": [],
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
            "attributes": [],
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

    expect(
        parse(`
      <div>
        hello {user.name}
        {message}
      </div>
    `),
    ).toMatchInlineSnapshot(`
      {
        "children": {
          "children": [
            {
              "raw": "
              hello ",
              "type": "TextNode",
            },
            {
              "key": [
                {
                  "type": "KeyNode",
                  "value": "user.name",
                },
              ],
              "type": "VariableNode",
            },
            {
              "key": [
                {
                  "type": "KeyNode",
                  "value": "message",
                },
              ],
              "type": "VariableNode",
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
            "attributes": [],
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
