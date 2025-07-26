import type { NodeList } from "@xstache/ast";
import { Template } from "@xstache/html-runtime";

import Compiler from "./compile.js";

export function compileToString(
    nodeList: NodeList,
    options: ModuleOptions = {},
): string {
    const implementation = new Compiler(true).compileToString(nodeList);
    return options.module ? wrapInModule(implementation) : implementation;
}

export function compileToTemplate(nodeList: NodeList) {
    const implementation = new Compiler(true).compileToFunction(nodeList);
    return new Template(implementation);
}

type ModuleOptions = Partial<{
    module: boolean;
}>;

function wrapInModule(implementation: string) {
    return [
        `import { Template } from "@xstache/html-runtime";`,
        `const implementation = ${implementation};`,
        "export default new Template(implementation);",
        "",
    ].join("\n");
}
