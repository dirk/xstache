import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { $, type Shell } from "zx";

async function exists(file: string) {
    try {
        await access(file);
        return true;
    } catch {
        return false;
    }
}

describe("xstache-jsx", () => {
    const testsDirectory = join(__dirname, "__tests__");

    let $$: Shell;

    const cleanup = async () => {
        await $$({ quiet: true })`rm *.jsx || true`;
    };

    beforeEach(async () => {
        // Use `$$` to run commands in the __tests__ directory.
        $$ = $({ cwd: testsDirectory });
        await cleanup();
    });

    afterEach(async () => {
        // Comment this out if you need to inspect the generated files.
        await cleanup();
    });

    test("creates a new file", async () => {
        expect.assertions(4);

        const inputFile = join(testsDirectory, "test.xstache");
        const outputFile = join(testsDirectory, "test.jsx");
        expect(await exists(outputFile)).toBe(false);

        const { stdout } =
            await $$`node ../../dist/cli.js --write ${inputFile}`;
        expect(stdout.trim()).toMatch(/src\/__tests__\/test\.xstache$/);

        expect(await exists(outputFile)).toBe(true);
        expect(await readFile(outputFile, "utf-8")).toMatchInlineSnapshot(`
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
