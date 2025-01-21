import type { NodeList } from "@xstache/ast";

import Compiler from "./compile.js";

interface Options {
    pretty?: boolean;
}

export function compile(nodeList: NodeList, options: Options = {}): string {
    const { pretty = false } = options;
    return new Compiler(pretty).compile(nodeList);
}
