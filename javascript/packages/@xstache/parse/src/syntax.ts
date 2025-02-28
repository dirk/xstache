import type { IdentifierNode } from "@xstache/ast";

import StringReader from "./reader.js";

export function isIdentifier(char: string): boolean {
    return /[a-zA-Z-]/.test(char);
}

export function identifier(reader: StringReader): IdentifierNode | undefined {
    const value = reader.readWhile(isIdentifier);
    return value !== "" ? { type: "IdentifierNode", value } : undefined;
}

export function isWhitespace(char: string): boolean {
    return /\s/.test(char);
}

export function whitespace(reader: StringReader): string {
    return reader.readWhile(isWhitespace);
}
