import * as ast from "@xstache/ast";

import type StringReader from "./reader.js";
import { whitespace } from "./syntax.js";
import key from "./key.js";
import children from "./children.js";

export default function section(
    reader: StringReader,
): ast.SectionNode | undefined {
    const opening = openingSection(reader);
    if (!opening) {
        return undefined;
    }

    const ownChildren = children(reader);

    const closing = closingSection(reader);
    if (!closing) {
        const pretty = JSON.stringify(opening);
        throw new Error(
            `Missing closing section for ${pretty} at ${reader.location}`,
        );
    }

    return {
        type: "SectionNode",
        opening,
        closing,
        children: ownChildren,
    };
}

function openingSection(
    reader: StringReader,
): ast.SectionOpeningNode | undefined {
    const peek = reader.peek(2);
    if (peek !== "{#") {
        return undefined;
    }
    // Consume the opening '{' and '#'.
    reader.read();
    reader.read();

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
        type: "SectionOpeningNode",
        key: ownKey,
    };
}

function closingSection(
    reader: StringReader,
): ast.SectionClosingNode | undefined {
    const peek = reader.peek(2);
    if (peek !== "{/") {
        return undefined;
    }
    // Consume the opening '{' and '/'.
    reader.read();
    reader.read();

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
        type: "SectionClosingNode",
        key: ownKey,
    };
}
