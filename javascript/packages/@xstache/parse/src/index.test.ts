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
                  "type": "IdentifierNode",
                  "value": "span",
                },
                "type": "ElementClosingNode",
              },
              "opening": {
                "attributes": [],
                "name": {
                  "type": "IdentifierNode",
                  "value": "span",
                },
                "selfClosing": false,
                "type": "ElementOpeningNode",
              },
              "type": "ElementNode",
            },
          ],
          "closing": {
            "name": {
              "type": "IdentifierNode",
              "value": "div",
            },
            "type": "ElementClosingNode",
          },
          "opening": {
            "attributes": [],
            "name": {
              "type": "IdentifierNode",
              "value": "div",
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
                  "value": "user",
                },
                {
                  "type": "KeyNode",
                  "value": "name",
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
              "type": "IdentifierNode",
              "value": "div",
            },
            "type": "ElementClosingNode",
          },
          "opening": {
            "attributes": [],
            "name": {
              "type": "IdentifierNode",
              "value": "div",
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
                "type": "IdentifierNode",
                "value": "foo",
              },
              "type": "ElementClosingNode",
            },
            "opening": {
              "attributes": [
                {
                  "name": {
                    "type": "IdentifierNode",
                    "value": "bar",
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
                    "type": "IdentifierNode",
                    "value": "boo",
                  },
                  "type": "AttributeNode",
                  "value": undefined,
                },
              ],
              "name": {
                "type": "IdentifierNode",
                "value": "foo",
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
                    "type": "IdentifierNode",
                    "value": "disabled",
                  },
                  "type": "AttributeNode",
                  "value": undefined,
                },
              ],
              "name": {
                "type": "IdentifierNode",
                "value": "input",
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
