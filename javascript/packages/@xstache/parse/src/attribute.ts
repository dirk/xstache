import type { AttributeNode } from "@xstache/ast";

import type StringReader from "./reader.js";
import { identifier } from "./syntax.js";
import variable from "./variable.js";

export default function attribute(
    reader: StringReader,
): AttributeNode | undefined {
    const name = identifier(reader);
    if (!name) {
        return undefined;
    }

    let value: AttributeNode["value"] = undefined;
    let char = reader.peek();
    if (char === "=") {
        reader.read();
        value = variable(reader);
    }

    return {
        type: "AttributeNode",
        name,
        value,
    };
}
