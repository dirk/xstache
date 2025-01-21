import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import { isIdentifier, isWhitespace } from "./syntax.js";
import variable from "./variable.js";

export default function children(
    reader: StringReader,
): [ast.Children, ast.ElementClosingNode | undefined] {
    let ownChildren: ast.Children = undefined;

    while (!reader.eof()) {
        let child: ast.Child;

        const text = anyText(reader);
        if (text) {
            child = text;
        } else {
            // This must be after `anyText()`; that way we will now be either on a non-text,
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

    let name: ast.IdentifierNode | ast.VariableNode;
    char = reader.peek();
    if (char === "{") {
        throw new Error("Variable element names not yet implemented");
    } else if (isIdentifier(char)) {
        name = {
            type: "IdentifierNode",
            name: reader.readWhile(isIdentifier),
        };
    } else {
        throw new Error(`Unexpected: '${char}'`);
    }

    let selfClosing = false;
    if (char === "/") {
        // TODO: Assert that this is an `ElementOpeningNode`.
        selfClosing = true;
        reader.read();
    }

    char = reader.peek();
    if (char !== ">") {
        throw new Error("Expected '>'");
    }
    reader.read();

    if (type === "ElementOpeningNode") {
        return {
            type,
            name,
            attributes: [],
            selfClosing,
        };
    } else {
        return {
            type,
            name,
        };
    }
}

function anyText(reader: StringReader): ast.TextNode | undefined {
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
