import {
    Attribute,
    ElementClosingNode,
    ElementNode,
    ElementOpeningNode,
} from "@xstache/ast";

import attribute from "./attribute.js";
import children from "./children.js";
import type StringReader from "./reader.js";
import { identifier, whitespace } from "./syntax.js";

export default function element(reader: StringReader): ElementNode | undefined {
    const opening = openingElement(reader);
    if (!opening) {
        return;
    }

    if (opening.selfClosing) {
        return {
            type: "ElementNode",
            opening,
            closing: undefined,
            children: undefined,
        };
    } else {
        const ownChildren = children(reader);

        const closing = closingElement(reader);
        if (!closing) {
            const pretty = JSON.stringify(opening);
            throw new Error(
                `Missing closing element for ${pretty} at ${reader.location}`,
            );
        }

        return {
            type: "ElementNode",
            opening,
            closing,
            children: ownChildren,
        };
    }
}

function openingElement(reader: StringReader): ElementOpeningNode | undefined {
    const peek = reader.peek(2);
    if (!peek || peek[0] !== "<" || peek === "</") {
        return undefined;
    }
    reader.read(); // Consume the '<'.

    const name = identifier(reader);
    if (!name) {
        throw new Error("Expected an identifier for the element name");
    }

    const attributes: Attribute[] = [];
    while (true) {
        const separator = whitespace(reader);
        // There must be some sort of whitespace (newline, space, tab, etc.) after the element
        // name/preceding attribute.
        if (separator === "") {
            break;
        }

        const ownAttribute = attribute(reader);
        if (!ownAttribute) {
            break;
        }
        attributes.push(ownAttribute);
    }

    let selfClosing = false;
    if (reader.peek() === "/") {
        selfClosing = true;
        reader.read();
    }

    const char = reader.read();
    if (char !== ">") {
        throw new Error(`Expected '>', got '${char}' at ${reader.location}`);
    }

    return {
        type: "ElementOpeningNode",
        name,
        attributes,
        selfClosing,
    };
}

function closingElement(reader: StringReader): ElementClosingNode | undefined {
    if (reader.peek(2) !== "</") {
        return undefined;
    }
    reader.read(); // Consume the '<',
    reader.read(); // and the '/'.

    const name = identifier(reader);
    if (!name) {
        throw new Error("Expected an identifier for the element name");
    }

    whitespace(reader);
    const location = reader.location;
    const char = reader.read();
    if (char !== ">") {
        throw new Error(`Expected '>', got '${char}' at ${location}`);
    }

    return {
        type: "ElementClosingNode",
        name,
    };
}
