import { expect, test } from "vitest";

import parse from "./index.js";

test("non-empty sections", () => {
    expect(
        parse(`
      {#foo}
          bar
          {#baz}qux{/baz}
      {/foo}
    `),
    ).toMatchInlineSnapshot(`
      {
        "children": {
          "children": [
            {
              "raw": "
                bar
                ",
              "type": "TextNode",
            },
            {
              "children": {
                "raw": "qux",
                "type": "TextNode",
              },
              "closing": {
                "key": [
                  {
                    "type": "KeyNode",
                    "value": "baz",
                  },
                ],
                "type": "SectionClosingNode",
              },
              "opening": {
                "key": [
                  {
                    "type": "KeyNode",
                    "value": "baz",
                  },
                ],
                "type": "SectionOpeningNode",
              },
              "type": "SectionNode",
            },
          ],
          "closing": {
            "key": [
              {
                "type": "KeyNode",
                "value": "foo",
              },
            ],
            "type": "SectionClosingNode",
          },
          "opening": {
            "key": [
              {
                "type": "KeyNode",
                "value": "foo",
              },
            ],
            "type": "SectionOpeningNode",
          },
          "type": "SectionNode",
        },
        "type": "NodeList",
      }
    `);
});
