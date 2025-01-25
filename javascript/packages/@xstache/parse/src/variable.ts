import * as ast from "@xstache/ast";

import key from "./key.js";
import type StringReader from "./reader.js";
import { whitespace } from "./syntax.js";

export default function variable(
    reader: StringReader,
): ast.VariableNode | undefined {
    const peek = reader.peek(2);
    if (
        !peek ||
        peek[0] !== "{" ||
        peek === "{#" ||
        peek === "{^" ||
        peek === "{/"
    ) {
        return undefined;
    }
    reader.read(); // Consume the '{'.

    whitespace(reader);
    const ownKey = key(reader);
    if (!ownKey) {
        throw new Error(`Expected key, got '${reader.peek()}'`);
    }

    const char = reader.read();
    if (char !== "}") {
        throw new Error(`Expected '}', got '${char}'`);
    }

    return {
        type: "VariableNode",
        key: ownKey,
    };
}
