import type { NodeList } from "@xstache/ast";
import { Template } from "@xstache/html-runtime";

import Compiler from "./compile.js";

export function compileToString(nodeList: NodeList): string {
    return new Compiler(true).compileToString(nodeList);
}

export function compileToTemplate(nodeList: NodeList) {
    const implementation = new Compiler(true).compileToFunction(nodeList);
    return new Template(implementation);
}
