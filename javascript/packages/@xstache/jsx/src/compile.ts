import * as t from "@babel/types";
import type {
    Child,
    Children,
    ElementNode,
    NodeList,
    TextNode,
    VariableNode,
} from "@xstache/ast";
import { generate, GENERATOR, Options } from "astring";

export default class Compiler {
    public readonly contextName = "c";
    public readonly runtimeName = "r";

    constructor(public readonly pretty: boolean = false) {}

    public compileToFunction(nodeList: NodeList) {
        const body = this.renderToString(
            t.returnStatement(this.children(nodeList.children)),
        );
        return new Function(this.runtimeName, this.contextName, body);
    }

    public compileToString(nodeList: NodeList) {
        const xs = t.functionExpression(
            undefined,
            [t.identifier(this.runtimeName), t.identifier(this.contextName)],
            t.blockStatement([
                t.returnStatement(this.children(nodeList.children)),
            ]),
        );
        const codeObject = t.objectExpression([
            t.objectProperty(t.identifier("xs"), xs),
        ]);
        return this.renderToString(codeObject);
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

    nodeList(nodeList: NodeList): t.Expression {
        const children = this.children(nodeList.children);
        if (t.isArrayExpression(children)) {
            return t.callExpression(this.jsx(), [
                this.fragment(),
                t.objectExpression([
                    t.objectProperty(t.identifier("children"), children),
                ]),
            ]);
        }
        return children;
    }

    children(children: Children): t.Expression {
        if (Array.isArray(children)) {
            return t.arrayExpression(
                children.map((child) => this.child(child)),
            );
        }
        return this.child(children);
    }

    child(child: Child): t.Expression {
        if (child === null) {
            return t.nullLiteral();
        } else if (child === undefined) {
            return { type: "UndefinedLiteral" } as unknown as t.NullLiteral;
        } else if (child.type === "ElementNode") {
            return this.element(child);
        } else if (child.type === "TextNode") {
            return this.text(child);
        } else if (child.type === "VariableNode") {
            return this.variable(child);
        }
        throw new Error(`Unreachable 4: ${child?.type}`);
    }

    element(element: ElementNode) {
        const { opening } = element;
        const props: t.ObjectProperty[] = [];
        for (const attribute of opening.attributes) {
            if (attribute.value) {
                props.push(
                    t.objectProperty(
                        t.stringLiteral(attribute.name.value),
                        this.child(attribute.value),
                    ),
                );
            } else {
                props.push(
                    t.objectProperty(
                        t.stringLiteral(attribute.name.value),
                        t.booleanLiteral(true),
                    ),
                );
            }
        }
        if (element.children) {
            props.push(
                t.objectProperty(
                    t.stringLiteral("children"),
                    this.children(element.children),
                ),
            );
        }
        return t.callExpression(this.jsx(), [
            t.stringLiteral(opening.name.value),
            t.objectExpression(props),
        ]);
    }

    variable(variable: VariableNode) {
        return t.callExpression(
            t.memberExpression(this.context(), t.identifier("v")),
            variable.key.map((key) => t.stringLiteral(key.value)),
        );
    }

    text(text: TextNode) {
        return t.stringLiteral(text.raw);
    }

    jsx() {
        return t.memberExpression(this.runtime(), t.identifier("jsx"));
    }

    fragment() {
        return t.memberExpression(this.runtime(), t.identifier("Fragment"));
    }

    context() {
        return t.identifier(this.contextName);
    }

    runtime() {
        return t.identifier(this.runtimeName);
    }
}
