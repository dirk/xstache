import { KeyNode } from "@xstache/ast";

import type StringReader from "./reader.js";
import { isWhitespace, whitespace } from "./syntax.js";

export default function key(reader: StringReader): KeyNode[] {
    let head = one(reader);
    if (!head) {
        throw new Error(`Unexpected character: '${reader.peek()}'`);
    }

    let parts = [head];
    while (true) {
        whitespace(reader);
        if (reader.peek() === ".") {
            reader.read();
            whitespace(reader);
            const next = one(reader);
            if (!next) {
                throw new Error(`Unexpected character: '${reader.peek()}'`);
            }
            parts.push(next);
        } else {
            break;
        }
    }

    return parts;
}

function one(reader: StringReader): KeyNode | undefined {
    const value = reader.readWhile(
        (char) => !isWhitespace(char) && char !== "." && char !== "}",
    );
    if (value === "") {
        return undefined;
    }
    return {
        type: "KeyNode",
        value,
    };
}
