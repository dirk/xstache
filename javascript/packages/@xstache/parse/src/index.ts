import * as ast from "@xstache/ast";

import StringReader from "./reader.js";

function parseChildren(
    reader: StringReader,
): [ast.Children, ast.ElementClosingNode | undefined] {
    let children = undefined;

    while (!reader.eof()) {
        const char = reader.peek();
        let child = undefined;

        if (char === "<") {
            const node = parseBaseElement(reader);
            if (node.type === "ElementClosingNode") {
                return [children, node];
            } else {
                child = parseElement(reader, node);
            }
        } else {
            const text = parseTextOrWhitespace(reader);
            if (text) child = text;
        }

        if (!child) {
            continue;
        }

        if (!children) {
            children = child;
        } else if (Array.isArray(children)) {
            children.push(child);
        } else {
            children = [children, child];
        }
    }

    return [children, undefined];
}

function parseElement(
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

    const [children, closing] = parseChildren(reader);
    if (!closing) {
        throw new Error("Expected closing element");
    }

    // TODO: Assert that the closing node matches the opening one.

    return {
        type: "ElementNode",
        opening,
        closing,
        children,
    };
}

function parseBaseElement(
    reader: StringReader,
): ast.ElementOpeningNode | ast.ElementClosingNode {
    let char = reader.read();
    if (char !== "<") {
        throw new Error("Expected '<'");
    }

    let type: (ast.ElementOpeningNode | ast.ElementClosingNode)["type"] =
        "ElementOpeningNode";
    char = reader.peek();
    if (char === "/") {
        type = "ElementClosingNode";
        reader.read();
    }

    let name: ast.IdentifierNode | ast.VariableNode;
    let selfClosing = false;
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

    if (char === "/") {
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
            selfClosing,
        };
    } else {
        return {
            type,
            name,
        };
    }
}

function isIdentifier(char: string): boolean {
    return /[a-zA-Z-]/.test(char);
}

function isWhitespace(char: string): boolean {
    return /\s/.test(char);
}

function parseTextOrWhitespace(reader: StringReader): ast.TextNode | undefined {
    let containsText = false;
    const value = reader.readWhile((char) => {
        if (isWhitespace(char)) {
            return true;
        } else if (char === "<") {
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

export default function parse(source: string): ast.NodeList {
    const reader = new StringReader(source);

    const [children, closing] = parseChildren(reader);
    if (closing) {
        throw new Error(
            `Unexpected closing element: ${JSON.stringify(closing, null, 4)}`,
        );
    }

    return {
        type: "NodeList",
        children,
    };
}
