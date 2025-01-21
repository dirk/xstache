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

    expect(
        parse(`
      <foo bar={baz} boo>
        hello world
      </foo>
      <input disabled />
    `),
    ).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": {
              "raw": "
              hello world
            ",
              "type": "TextNode",
            },
            "closing": {
              "name": {
                "name": "foo",
                "type": "IdentifierNode",
              },
              "type": "ElementClosingNode",
            },
            "opening": {
              "attributes": [
                {
                  "name": {
                    "name": "bar",
                    "type": "IdentifierNode",
                  },
                  "type": "AttributeNode",
                  "value": {
                    "key": [
                      {
                        "type": "KeyNode",
                        "value": "baz",
                      },
                    ],
                    "type": "VariableNode",
                  },
                },
                {
                  "name": {
                    "name": "boo",
                    "type": "IdentifierNode",
                  },
                  "type": "AttributeNode",
                  "value": undefined,
                },
              ],
              "name": {
                "name": "foo",
                "type": "IdentifierNode",
              },
              "selfClosing": false,
              "type": "ElementOpeningNode",
            },
            "type": "ElementNode",
          },
          {
            "children": undefined,
            "closing": undefined,
            "opening": {
              "attributes": [
                {
                  "name": {
                    "name": "disabled",
                    "type": "IdentifierNode",
                  },
                  "type": "AttributeNode",
                  "value": undefined,
                },
              ],
              "name": {
                "name": "input",
                "type": "IdentifierNode",
              },
              "selfClosing": true,
              "type": "ElementOpeningNode",
            },
            "type": "ElementNode",
          },
        ],
        "type": "NodeList",
      }
    `);
});
