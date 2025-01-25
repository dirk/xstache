import { KeyNode } from "@xstache/ast";

import type StringReader from "./reader.js";
import { whitespace } from "./syntax.js";

export default function key(reader: StringReader): KeyNode[] | undefined {
    let head = one(reader);
    if (!head) {
        throw new Error(`Unexpected character: '${reader.peek()}'`);
    }

    let keyComponents = [head];
    while (true) {
        whitespace(reader);
        const char = reader.peek();
        if (char === ".") {
            reader.read();
            whitespace(reader);
            const next = one(reader);
            if (!next) {
                throw new Error(`Unexpected character: '${reader.peek()}'`);
            }
            keyComponents.push(next);
        } else {
            break;
        }
    }

    return keyComponents;
}

function one(reader: StringReader): KeyNode | undefined {
    const value = reader.readWhile((char) => !/[\s.}]/.test(char));
    if (value === "") {
        return undefined;
    }
    return {
        type: "KeyNode",
        value,
    };
}
