#!/usr/bin/env node
import chalk from "chalk";
import fg from "fast-glob";
import type { Stats } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import parse from "@xstache/parse";

import { compileToString } from "./index.js";

const argv = yargs(hideBin(process.argv))
    .help()
    .options({
        write: {
            alias: "w",
            default: false,
            type: "boolean",
        },
    });
const parsed = argv.parseSync();
const args = parsed._;

if (args.length === 0) {
    argv.showHelp("log");
    process.exit(1);
}

async function resolveInput(input: string) {
    let stats: Stats | undefined = undefined;
    try {
        stats = await stat(input);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }

    if (stats) {
        if (stats.isFile()) {
            return [input];
        } else {
            throw new Error(`Input "${input}" is not a file`);
        }
    } else {
        // If the file doesn't exist then interpret it as a glob.
        const files = await fg(input, { dot: true });
        files.sort();
        return files;
    }
}

function getOutputFile(file: string) {
    if (file.endsWith(".xstache")) {
        return file.slice(0, -".xstache".length) + ".jsx";
    }
    return file + ".jsx";
}

async function command(inputs: string[]) {
    const fileGroups = await Promise.all(inputs.map(resolveInput));
    const files = fileGroups.flatMap((group) => group);

    async function next() {
        if (files.length === 0) {
            return;
        }

        const file = files.shift();
        if (typeof file !== "string") {
            // TODO: Warn.
            await next();
            return;
        }
        const source = await readFile(file, "utf-8");

        // Start reading the next file while we're processing the current one.
        const successor = next();

        const nodeList = parse(source);
        const outputSource = compileToString(nodeList, {
            module: true,
        });

        if (parsed.write) {
            const outputFile = getOutputFile(file);
            let existingOutputSource: string | undefined = undefined;
            try {
                existingOutputSource = await readFile(outputFile, "utf-8");
            } catch (error) {
                if (error.code !== "ENOENT") {
                    throw error;
                }
            }

            if (outputSource === existingOutputSource) {
                console.log(`${chalk.dim(file)} (unchanged)`);
            } else {
                await writeFile(outputFile, outputSource);
                console.log(file);
            }
        } else {
            console.log(outputSource);
        }

        await successor;
    }

    next();
}

command(args.map(String));
