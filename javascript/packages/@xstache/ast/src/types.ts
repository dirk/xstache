export interface NodeList {
    type: "NodeList";
    children: Children;
}

export type Children = Child[] | Child;

export type Child =
    | ElementNode
    | TextNode
    | VariableNode
    | SectionNode
    | InvertedSectionNode
    | CommentNode
    | null
    | undefined;

export interface ElementNode {
    type: "ElementNode";
    opening: ElementOpeningNode;
    closing: ElementClosingNode | null | undefined;
    children: Children;
}

export interface ElementOpeningNode {
    type: "ElementOpeningNode";
    name: IdentifierNode | VariableNode;
    selfClosing: boolean;
}

export interface ElementClosingNode {
    type: "ElementClosingNode";
    name: IdentifierNode | VariableNode;
}

export interface IdentifierNode {
    type: "IdentifierNode";
    name: string;
}

export interface TextNode {
    type: "TextNode";
    raw: string;
}

export interface VariableNode {
    type: "VariableNode";
    raw: string;
}

export interface SectionNode {
    type: "SectionNode";
    opening: SectionOpeningNode;
    closing: SectionClosingNode;
    children: Children;
}

export interface SectionOpeningNode {
    type: "SectionOpeningNode";
    raw: string;
}

export interface SectionClosingNode {
    type: "SectionClosingNode";
    raw: string;
}

export interface InvertedSectionNode {
    type: "InvertedSectionNode";
    opening: SectionOpeningNode;
    closing: SectionClosingNode;
    children: Children;
}

export interface CommentNode {
    type: "CommentNode";
    raw: string;
}
