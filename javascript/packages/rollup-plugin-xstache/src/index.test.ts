import { rollup, type RollupBuild } from "rollup";
import { beforeAll, describe, expect, test } from "vitest";

import { xstacheHtml, xstacheJsx } from "./index.js";

process.chdir(__dirname);

async function generateAndEvaluate(bundle: RollupBuild) {
    const { output } = await bundle.generate({
        format: "cjs",
        exports: "auto",
    });
    const [{ code }] = output;
    const body = `
        let result;
        ${code}
        return result;
    `;
    const implementation = new Function("module", "require", body);
    const module = { exports: {} };
    return implementation(module, require);
}

describe("xstacheHtml", () => {
    let render: (data: any) => string;

    beforeAll(async () => {
        const bundle = await rollup({
            input: "__tests__/test.js",
            plugins: [xstacheHtml()],
            external: ["@xstache/html-runtime"],
        });
        render = await generateAndEvaluate(bundle);
    });

    test("renders", () => {
        expect(render({ name: "World" })).toMatchInlineSnapshot(
            `"<div>Hello World</div>"`,
        );
    });
});
