import type { NodeList } from "@xstache/ast";
import { Template } from "@xstache/jsx-runtime";

import Compiler from "./compile.js";

interface Options {
    pretty?: boolean;
}

export function compileToTemplate(
    nodeList: NodeList,
    options: Options = {},
): Template {
    const xs = buildCompiler(options).compileToFunction(nodeList);
    return new Template({ xs });
}

export function compileToString(
    nodeList: NodeList,
    options: Options = {},
): string {
    return buildCompiler(options).compileToString(nodeList);
}

function buildCompiler(options: Options) {
    const { pretty = false } = options;
    return new Compiler(pretty);
}
