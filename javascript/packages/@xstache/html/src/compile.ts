import * as t from "@babel/types";
import type {
    AttributeNode,
    Child,
    Children,
    ElementNode,
    NodeList,
    SectionNode,
    TextNode,
    VariableNode,
} from "@xstache/ast";
import { Implementation } from "@xstache/html-runtime";
import { generate, GENERATOR, Options } from "astring";

export default class Compiler {
    public readonly contextName = "c";
    public readonly bufferName = "b";

    constructor(public readonly pretty: boolean = false) {}

    public compileToFunction(nodeList: NodeList) {
        const body = this.renderToString(
            t.blockStatement(this.nodeList(nodeList)),
        );
        return new Function(
            this.contextName,
            this.bufferName,
            body,
        ) as Implementation;
    }

    public compileToString(nodeList: NodeList) {
        const implementation = t.functionExpression(
            undefined,
            [this.context(), this.buffer()],
            t.blockStatement(this.nodeList(nodeList)),
        );
        return this.renderToString(implementation);
    }

    renderToString(node: t.Node) {
        const customGenerator = Object.assign({}, GENERATOR, {
            ObjectProperty(node, state) {
                customGenerator.Property(
                    {
                        kind: "init",
                        ...node,
                    },
                    state,
                );
            },
            StringLiteral(node, state) {
                customGenerator.Literal(node, state);
            },
        });
        const options: Options = { generator: customGenerator };
        if (!this.pretty) {
            options.indent = "";
            options.lineEnd = "";
        }
        return generate(node, options);
    }

    nodeList(nodeList: NodeList): t.Statement[] {
        return this.children(nodeList.children);
    }

    children(children: Children) {
        const statements: t.Statement[] = [];
        const iterable = Array.isArray(children) ? children : [children];
        for (const child of iterable) {
            if (child) {
                statements.push(this.child(child));
            }
        }
        return statements;
    }

    child(child: NonNullable<Child>): t.Statement {
        let expression: t.Expression;
        if (child.type === "ElementNode") {
            expression = this.element(child);
        } else if (child.type === "TextNode") {
            expression = this.text(child);
        } else if (child.type === "SectionNode") {
            expression = this.section(child);
        } else if (child.type === "VariableNode") {
            expression = this.push(
                t.logicalExpression(
                    "??",
                    this.variable(child),
                    t.stringLiteral(""),
                ),
            );
        } else {
            throw new Error(`Unreachable: ${child?.type}`);
        }
        return t.expressionStatement(expression);
    }

    element(element: ElementNode) {
        const { opening } = element;
        const props: t.ObjectProperty[] = [];
        for (const attribute of opening.attributes) {
            props.push(
                t.objectProperty(
                    t.stringLiteral(attribute.name.value),
                    this.attribute(attribute.value),
                ),
            );
        }
        const implementation = opening.selfClosing
            ? t.identifier("undefined")
            : t.arrowFunctionExpression(
                  [],
                  t.blockStatement(this.children(element.children)),
              );
        return t.callExpression(
            t.memberExpression(this.context(), t.identifier("element")),
            [
                t.stringLiteral(opening.name.value),
                t.objectExpression(props),
                implementation,
                this.buffer(),
            ],
        );
    }

    attribute(value: AttributeNode["value"]): t.Expression {
        if (value === undefined) {
            return t.booleanLiteral(true);
        } else if (value?.type === "VariableNode") {
            return this.variable(value);
        }
        throw new Error(`Unreachable: ${value?.type}`);
    }

    variable(variable: VariableNode): t.Expression {
        return t.callExpression(
            t.memberExpression(this.context(), t.identifier("value")),
            [
                t.arrayExpression(
                    variable.key.map((key) => t.stringLiteral(key.value)),
                ),
            ],
        );
    }

    section(section: SectionNode) {
        return t.callExpression(
            t.memberExpression(this.context(), t.identifier("section")),
            [
                t.arrayExpression(
                    section.opening.key.map((key) =>
                        t.stringLiteral(key.value),
                    ),
                ),
                t.arrowFunctionExpression(
                    [this.context()],
                    t.blockStatement(this.children(section.children)),
                ),
            ],
        );
    }

    text(text: TextNode) {
        return this.push(t.stringLiteral(text.raw));
    }

    push(expression: t.Expression): t.Expression {
        return t.callExpression(
            t.memberExpression(this.buffer(), t.identifier("push")),
            [expression],
        );
    }

    buffer() {
        return t.identifier(this.bufferName);
    }

    context() {
        return t.identifier(this.contextName);
    }
}
