import * as ast from "@xstache/ast";

import children from "./children.js";
import StringReader from "./reader.js";

export default function parse(source: string): ast.NodeList {
    const reader = new StringReader(source);

    const [sourceChildren, closing] = children(reader);
    if (closing) {
        throw new Error(
            `Unexpected closing element: ${JSON.stringify(closing, null, 4)}`,
        );
    }

    return {
        type: "NodeList",
        children: sourceChildren,
    };
}
