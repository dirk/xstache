import type { NodeList } from "@xstache/ast";
import { type JsxRuntime, Template } from "@xstache/jsx-runtime";

import Compiler from "./compile.js";

export function compileToTemplate(
    nodeList: NodeList,
    jsxRuntime: JsxRuntime,
    options: CompilerOptions = {},
): Template {
    const implementation = buildCompiler(options).compileToFunction(nodeList);
    return new Template(implementation, jsxRuntime);
}

type ModuleOptions = Partial<{
    module: boolean;
    jsxImportSource: string | false;
}>;

export function compileToString(
    nodeList: NodeList,
    options: CompilerOptions & ModuleOptions = {},
): string {
    const implementation = buildCompiler(options).compileToString(nodeList);
    return options.module
        ? wrapInModule(implementation, options)
        : implementation;
}

type CompilerOptions = Partial<{
    pretty?: boolean;
}>;

function buildCompiler(options: CompilerOptions) {
    const { pretty = true } = options;
    return new Compiler(pretty);
}

function wrapInModule(implementation: string, options: ModuleOptions) {
    const lines: string[] = [];
    if (options.jsxImportSource !== false) {
        let jsxImportSource = options.jsxImportSource ?? "react/jsx-runtime";
        lines.push(
            `import * as jsxRuntime from ${JSON.stringify(jsxImportSource)};`,
        );
    }
    lines.push(`import { Template } from "@xstache/jsx-runtime";`);
    lines.push(`const implementation = ${implementation};`);
    lines.push(`export default new Template(implementation, jsxRuntime);`);
    lines.push(""); // Include a trailing newline.
    return lines.join("\n");
}
