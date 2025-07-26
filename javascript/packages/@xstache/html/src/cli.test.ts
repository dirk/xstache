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

describe("xstache-html", () => {
    const testsDirectory = join(__dirname, "__tests__");

    let $$: Shell;

    const cleanup = async () => {
        await $$({ quiet: true })`rm *.js || true`;
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
        const outputFile = join(testsDirectory, "test.js");
        expect(await exists(outputFile)).toBe(false);

        const { stdout } =
            await $$`node ../../dist/cli.js --write ${inputFile}`;
        expect(stdout.trim()).toMatch(/src\/__tests__\/test\.xstache$/);

        expect(await exists(outputFile)).toBe(true);
        expect(await readFile(outputFile, "utf-8")).toMatchInlineSnapshot(`
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

    test("handles an empty file", async () => {
        expect.assertions(2);

        const inputFile = join(testsDirectory, "empty.xstache");
        const outputFile = join(testsDirectory, "empty.js");
        expect(await exists(outputFile)).toBe(false);

        await $$`node ../../dist/cli.js --write ${inputFile}`;

        expect(await readFile(outputFile, "utf-8")).toMatchInlineSnapshot(`
          "import { Template } from "@xstache/html-runtime";
          const implementation = function (c, b) {};
          export default new Template(implementation);
          "
        `);
    });

    test("handles a glob of files", async () => {
        expect.assertions(4);

        const outputFiles = [
            join(testsDirectory, "test.js"),
            join(testsDirectory, "empty.js"),
        ];
        for (const file of outputFiles) {
            expect(await exists(file)).toBe(false);
        }

        await $$`node ../../dist/cli.js --write "*.xstache"`;

        expect(await readFile(outputFiles[0], "utf-8")).toMatchInlineSnapshot(`
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
        expect(await readFile(outputFiles[1], "utf-8")).toMatchInlineSnapshot(`
          "import { Template } from "@xstache/html-runtime";
          const implementation = function (c, b) {};
          export default new Template(implementation);
          "
        `);
    });
});
