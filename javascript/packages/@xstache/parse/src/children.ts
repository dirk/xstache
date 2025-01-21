import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import { identifier, isWhitespace, whitespace } from "./syntax.js";
import variable from "./variable.js";
import attribute from "./attribute.js";

export default function children(reader: StringReader): ast.Children {
    let ownChildren: ast.Children = undefined;

    while (true) {
        const ownChild = child(reader);
        if (!ownChild) {
            break;
        }

        if (!ownChildren) {
            ownChildren = ownChild;
        } else if (Array.isArray(ownChildren)) {
            ownChildren.push(ownChild);
        } else {
            ownChildren = [ownChildren, ownChild];
        }
    }

    return ownChildren;
}

function child(reader: StringReader): ast.Child | undefined {
    const ownText = text(reader);
    if (ownText) {
        return ownText;
    }

    const ownVariable = variable(reader);
    if (ownVariable) {
        return ownVariable;
    }

    const opening = openingElement(reader);
    if (opening) {
        if (opening.selfClosing) {
            return {
                type: "ElementNode",
                opening,
                closing: undefined,
                children: undefined,
            };
        } else {
            return element(reader, opening);
        }
    }

    return undefined;
}

function element(
    reader: StringReader,
    opening: ast.ElementOpeningNode,
): ast.ElementNode {
    const ownChildren = children(reader);

    const closing = closingElement(reader);
    if (!closing) {
        console.log({ ownChildren });
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

function openingElement(
    reader: StringReader,
): ast.ElementOpeningNode | undefined {
    const peek = reader.peek(2);
    if (!peek || peek[0] !== "<" || peek === "</") {
        return undefined;
    }
    reader.read(); // Consume the '<'.

    const name = identifier(reader);
    if (!name) {
        throw new Error("Expected an identifier for the element name");
    }

    const attributes: ast.Attribute[] = [];
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

    const char = reader.peek();
    if (char !== ">") {
        throw new Error(`Expected '>', got '${char}' at ${reader.location}`);
    }
    reader.read();

    return {
        type: "ElementOpeningNode",
        name,
        attributes,
        selfClosing,
    };
}

function closingElement(
    reader: StringReader,
): ast.ElementClosingNode | undefined {
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
    const char = reader.peek();
    if (char !== ">") {
        throw new Error(`Expected '>', got '${char}' at ${reader.location}`);
    }
    reader.read();

    return {
        type: "ElementClosingNode",
        name,
    };
}

function text(reader: StringReader): ast.TextNode | undefined {
    let containsText = false;
    const value = reader.readWhile((char) => {
        if (isWhitespace(char)) {
            return true;
        } else if (char === "<" || char === "{") {
            return false;
        } else {
            containsText = true;
            return true;
        }
    });
    if (value && containsText) {
        return {
            type: "TextNode",
            raw: value,
        };
    }
    return undefined;
}
