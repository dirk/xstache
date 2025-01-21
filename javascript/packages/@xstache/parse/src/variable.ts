import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import { whitespace } from "./syntax.js";

export default function variable(reader: StringReader): ast.VariableNode {
    let char = reader.read();
    if (char !== "{") {
        throw new Error(`Expected '{', got '${char}'`);
    }

    whitespace(reader);
    let head = key(reader);
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
            const next = key(reader);
            if (!next) {
                throw new Error(`Unexpected character: '${reader.peek()}'`);
            }
            keyComponents.push(next);
        } else {
            break;
        }
    }

    char = reader.read();
    if (char !== "}") {
        throw new Error(`Expected '}', got '${char}'`);
    }

    return {
        type: "VariableNode",
        key: keyComponents,
    };
}

function key(reader: StringReader): ast.KeyNode | undefined {
    const value = reader.readWhile((char) => !/[\s}]/.test(char));
    if (value === "") {
        return undefined;
    }
    return {
        type: "KeyNode",
        value,
    };
}
