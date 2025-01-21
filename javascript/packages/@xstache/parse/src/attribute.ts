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
    if (reader.peek() === "=") {
        reader.read();
        const ownVariable = variable(reader);
        if (ownVariable) {
            value = ownVariable;
        } else {
            throw new Error(
                `Expected variable, got '${reader.peek()}' at ${reader.location}`,
            );
        }
    }

    return {
        type: "AttributeNode",
        name,
        value,
    };
}
