import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import { identifier, isWhitespace, whitespace } from "./syntax.js";
import variable from "./variable.js";
import attribute from "./attribute.js";

export default function children(
    reader: StringReader,
): [ast.Children, ast.ElementClosingNode | undefined] {
    let ownChildren: ast.Children = undefined;

    while (!reader.eof()) {
        let child: ast.Child;

        const ownText = text(reader);
        if (ownText) {
            child = ownText;
        } else {
            // This must be after `text()`; that way we will now be either on a non-text,
            // non-whitespace character or at the end of input.
            const char = reader.peek();
            if (char === undefined) {
                break; // At the end of input.
            } else if (char === "<") {
                const node = elementTag(reader);
                if (node.type === "ElementClosingNode") {
                    return [ownChildren, node];
                } else {
                    child = element(reader, node);
                }
            } else if (char === "{") {
                child = variable(reader);
            } else {
                throw new Error(`Unexpected: '${char}'`);
            }
        }

        if (!ownChildren) {
            ownChildren = child;
        } else if (Array.isArray(ownChildren)) {
            ownChildren.push(child);
        } else {
            ownChildren = [ownChildren, child];
        }
    }

    return [ownChildren, undefined];
}

function element(
    reader: StringReader,
    opening: ast.ElementOpeningNode,
): ast.ElementNode {
    if (opening.selfClosing) {
        return {
            type: "ElementNode",
            opening,
            closing: undefined,
            children: undefined,
        };
    }

    const [ownChildren, closing] = children(reader);
    if (!closing) {
        throw new Error(
            `Expected closing element for: ${JSON.stringify(opening, null, 4)}`,
        );
    }

    // TODO: Assert that the closing node matches the opening one.

    return {
        type: "ElementNode",
        opening,
        closing,
        children: ownChildren,
    };
}

/**
 * Parses the literal element tag. In other words: everything between the `<` and `>`, but without
 * any semantic meaning.
 *
 * Use `element()` to get a logically sound tree of balanaced elements and self-closing elements
 * (and errors if said tree can't be constructed).
 */
function elementTag(
    reader: StringReader,
): ast.ElementOpeningNode | ast.ElementClosingNode {
    let char = reader.read();
    if (char !== "<") {
        throw new Error(`Expected '<', got '${char}'`);
    }

    let type: (ast.ElementOpeningNode | ast.ElementClosingNode)["type"] =
        "ElementOpeningNode";
    char = reader.peek();
    if (char === "/") {
        type = "ElementClosingNode";
        reader.read();
    }

    const name = identifier(reader);
    if (!name) {
        throw new Error("Expected an identifier for the element name");
    }

    const attributes: ast.Attribute[] = [];
    if (type === "ElementOpeningNode") {
        while (!reader.eof()) {
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
    } else {
        // Still consume whitespace after the tag name.
        whitespace(reader);
    }

    let selfClosing = false;
    char = reader.peek();
    if (char === "/") {
        if (type === "ElementClosingNode") {
            throw new Error("Unexpected '/' in closing element tag");
        }
        selfClosing = true;
        reader.read();
    }

    char = reader.peek();
    if (char !== ">") {
        throw new Error(`Expected '>', got '${char}' at ${reader.location}`);
    }
    reader.read();

    if (type === "ElementOpeningNode") {
        return {
            type,
            name,
            attributes,
            selfClosing,
        };
    } else {
        return {
            type,
            name,
        };
    }
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
