import type { NodeList } from "@xstache/ast";
import { type JsxRuntime, Template } from "@xstache/jsx-runtime";

import Compiler from "./compile.js";

interface Options {
    pretty?: boolean;
}

export function compileToTemplate(
    nodeList: NodeList,
    jsxRuntime: JsxRuntime,
    options: Options = {},
): Template {
    const implementation = buildCompiler(options).compileToFunction(nodeList);
    return new Template(implementation, jsxRuntime);
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
