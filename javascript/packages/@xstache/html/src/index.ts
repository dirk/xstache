import type { NodeList } from "@xstache/ast";
import Compiler from "./compile.js";

export function compileToString(nodeList: NodeList): string {
    return new Compiler(true).compileToString(nodeList);
}
