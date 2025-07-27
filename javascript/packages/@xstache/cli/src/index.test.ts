import { readFile, stat, writeFile } from "node:fs/promises";
import {
    afterAll,
    afterEach,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";
import yargs from "yargs";

import cli from "./index.js";

vi.mock("node:fs", { spy: true });
vi.mock("node:fs/promises", { spy: true });
vi.mock("yargs", { spy: true });

describe("cli", () => {
    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("with an input file", () => {
        const input = "input.xstache";
        let write = false;

        beforeEach(() => {
            vi.mocked(yargs).mockReturnValue({
                help: vi.fn().mockReturnThis(),
                options: vi.fn().mockReturnThis(),
                parseSync: vi.fn(() => ({
                    _: [input],
                    write,
                })),
                showHelp: vi.fn(),
            });
            vi.mocked(readFile).mockReset();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        test("prints compiled source to console", async () => {
            expect.assertions(3);

            const compiledSource = "compiled source";
            vi.mocked(readFile).mockResolvedValue("template content");
            // @ts-expect-error Incomplete mock.
            vi.mocked(stat).mockResolvedValue({ isFile: () => true });

            const consoleLog = vi
                .spyOn(console, "log")
                .mockImplementation(() => undefined);

            await cli(() => compiledSource, "foo");

            expect(consoleLog).toHaveBeenCalledExactlyOnceWith(compiledSource);
            expect(vi.mocked(readFile)).toHaveBeenCalledExactlyOnceWith(
                input,
                "utf-8",
            );
            expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
        });

        test("can write to an output file", async () => {
            expect.assertions(5);

            const extension = "foo";
            const output = `input.${extension}`;
            const compiledSource = "compiled source";

            write = true;
            vi.mocked(readFile).mockImplementation((path) => {
                if (path === input) {
                    return Promise.resolve("template content");
                } else if (path === output) {
                    return Promise.resolve("existing content");
                }
                return Promise.reject(new Error("File not found"));
            });
            // @ts-expect-error Incomplete mock.
            vi.mocked(stat).mockResolvedValue({ isFile: () => true });
            vi.mocked(writeFile).mockResolvedValue(undefined);

            const consoleLog = vi
                .spyOn(console, "log")
                .mockImplementation(() => undefined);

            await cli(() => compiledSource, extension);

            expect(consoleLog).toHaveBeenCalledExactlyOnceWith(input);
            expect(vi.mocked(readFile)).toHaveBeenCalledTimes(2);
            expect(vi.mocked(readFile)).toHaveBeenNthCalledWith(
                1,
                input,
                "utf-8",
            );
            expect(vi.mocked(readFile)).toHaveBeenNthCalledWith(
                2,
                output,
                "utf-8",
            );
            expect(vi.mocked(writeFile)).toHaveBeenCalledExactlyOnceWith(
                output,
                compiledSource,
            );
        });
    });
});
