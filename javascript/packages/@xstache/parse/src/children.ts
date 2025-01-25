import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import section from "./section.js";
import { isWhitespace } from "./syntax.js";
import variable from "./variable.js";
import element from "./element.js";

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

    const ownElement = element(reader);
    if (ownElement) {
        return ownElement;
    }

    const ownSection = section(reader);
    if (ownSection) {
        return ownSection;
    }

    const ownVariable = variable(reader);
    if (ownVariable) {
        return ownVariable;
    }

    return undefined;
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
