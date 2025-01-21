import * as ast from "@xstache/ast";

import children from "./children.js";
import StringReader from "./reader.js";

export default function parse(source: string): ast.NodeList {
    const reader = new StringReader(source);

    const ownChildren = children(reader);

    return {
        type: "NodeList",
        children: ownChildren,
    };
}
