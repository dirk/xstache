import * as t from "@babel/types";
import type {
    Child,
    Children,
    ElementNode,
    NodeList,
    SectionNode,
    TextNode,
    VariableNode,
} from "@xstache/ast";
import { type Implementation } from "@xstache/jsx-runtime";
import { generate, GENERATOR, Options } from "astring";

export default class Compiler {
    public readonly contextName = "c";
    public readonly runtimeName = "r";

    constructor(public readonly pretty: boolean = false) {}

    public compileToFunction(nodeList: NodeList) {
        const body = this.renderToString(
            t.returnStatement(this.nodeList(nodeList)),
        );
        return new Function(
            this.contextName,
            this.runtimeName,
            body,
        ) as Implementation;
    }

    public compileToString(nodeList: NodeList) {
        const implementation = t.functionExpression(
            undefined,
            [t.identifier(this.contextName), t.identifier(this.runtimeName)],
            t.blockStatement([t.returnStatement(this.nodeList(nodeList))]),
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

    nodeList(nodeList: NodeList): t.Expression {
        return this.wrap(this.children(nodeList.children));
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
            return this.undefined();
        } else if (child.type === "ElementNode") {
            return this.element(child);
        } else if (child.type === "TextNode") {
            return this.text(child);
        } else if (child.type === "SectionNode") {
            return this.section(child);
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
        let factory = this.jsx();
        if (element.children) {
            const children = this.children(element.children);
            if (t.isArrayExpression(children)) {
                factory = this.jsxs();
            }
            props.push(t.objectProperty(t.stringLiteral("children"), children));
        }
        return t.callExpression(factory, [
            t.stringLiteral(opening.name.value),
            t.objectExpression(props),
        ]);
    }

    variable(variable: VariableNode) {
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
                    [t.identifier(this.contextName)],
                    this.wrap(this.children(section.children)),
                ),
                this.runtime(),
            ],
        );
    }

    text(text: TextNode) {
        return t.stringLiteral(text.raw);
    }

    jsx() {
        return t.memberExpression(this.runtime(), t.identifier("jsx"));
    }

    jsxs() {
        return t.memberExpression(this.runtime(), t.identifier("jsxs"));
    }

    /** Wrap the children into a JSX fragment if it's an array. */
    wrap(children: t.Expression) {
        if (!t.isArrayExpression(children)) {
            return children;
        }
        const callee = t.memberExpression(
            this.runtime(),
            t.identifier("Fragment"),
        );
        return t.callExpression(this.jsx(), [
            callee,
            t.objectExpression([
                t.objectProperty(t.identifier("children"), children),
            ]),
        ]);
    }

    context() {
        return t.identifier(this.contextName);
    }

    runtime() {
        return t.identifier(this.runtimeName);
    }

    undefined() {
        return { type: "UndefinedLiteral" } as unknown as t.NullLiteral;
    }
}
