import type { NodeList } from "@xstache/ast";
import { componentFactory, type JsxRuntime } from "@xstache/jsx-runtime";

import Compiler from "./compile.js";

export function compileToComponent(
    nodeList: NodeList,
    jsxRuntime: JsxRuntime,
    options: CompilerOptions = {},
): (props: any) => any {
    const implementation = buildCompiler(options).compileToFunction(nodeList);
    return componentFactory(implementation, jsxRuntime);
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
    lines.push(`import { componentFactory } from "@xstache/jsx-runtime";`);
    lines.push(`const implementation = ${implementation};`);
    lines.push(`export default componentFactory(implementation, jsxRuntime);`);
    lines.push(""); // Include a trailing newline.
    return lines.join("\n");
}
