import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { $ } from "zx";

const $$ = $({ cwd: __dirname });

describe("xstache-html", () => {
    test("prints input files to stdout", async () => {
        expect.assertions(3);
        const input = join(__dirname, "__tests__", "test.xstache");
        const { stdout, stderr, exitCode } =
            await $$`pnpm exec xstache-html ${input}`;
        expect(exitCode).toBe(0);
        expect(stderr).toBe("");
        expect(stdout).toMatchInlineSnapshot(`
          "import { Template } from "@xstache/html-runtime";
          const implementation = function (c, b) {
            c.element("div", {
              "foo": c.value(["bar"])
            }, () => {
              b.push("Hello ");
              b.push(c.value(["name"]) ?? "");
            }, b);
            c.element("input", {}, undefined, b);
          };
          export default new Template(implementation);

          "
        `);
    });
});

describe("xstache-jsx", () => {
    test("prints input files to stdout", async () => {
        expect.assertions(3);
        const input = join(__dirname, "__tests__", "test.xstache");
        const { stdout, stderr, exitCode } =
            await $$`pnpm exec xstache-jsx ${input}`;
        expect(exitCode).toBe(0);
        expect(stderr).toBe("");
        expect(stdout).toMatchInlineSnapshot(`
          "import * as jsxRuntime from "react/jsx-runtime";
          import { componentFactory } from "@xstache/jsx-runtime";
          const implementation = function (c, r) {
            return r.jsx(r.Fragment, {
              children: [r.jsxs("div", {
                "foo": c.value(["bar"]),
                "children": ["Hello ", c.value(["name"])]
              }), r.jsx("input", {})]
            });
          };
          export default componentFactory(implementation, jsxRuntime);

          "
        `);
    });
});
