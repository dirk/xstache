import type { IdentifierNode } from "@xstache/ast";

import StringReader from "./reader.js";

export function isIdentifier(char: string): boolean {
    return /[a-zA-Z-]/.test(char);
}

export function identifier(reader: StringReader): IdentifierNode | undefined {
    const name = reader.readWhile(isIdentifier);
    return name !== "" ? { type: "IdentifierNode", name } : undefined;
}

export function isWhitespace(char: string): boolean {
    return /\s/.test(char);
}

export function whitespace(reader: StringReader): string {
    return reader.readWhile(isWhitespace);
}
