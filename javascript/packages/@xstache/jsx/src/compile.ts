import * as t from "@babel/types";
import type { Child, ElementNode, NodeList } from "@xstache/ast";
import { generate, GENERATOR } from "astring";

export default class Compiler {
    constructor(private readonly pretty: boolean = false) {}

    public compile(nodeList: NodeList) {
        const expr = this.nodeListExpr(nodeList);
        const customGenerator = Object.assign({}, GENERATOR, {
            ObjectProperty(node, state) {
                GENERATOR.Property(
                    {
                        kind: "init",
                        ...node,
                    },
                    state,
                );
            },
            StringLiteral(node, state) {
                GENERATOR.Literal(node, state);
            },
        });
        return generate(expr, { generator: customGenerator });
    }

    nodeListExpr(nodeList: NodeList) {
        let children: t.Expression | undefined = undefined;
        if (Array.isArray(nodeList.children)) {
            children = t.arrayExpression(
                nodeList.children.map((child) => this.childExpr(child!)),
            );
        } else if (nodeList.children) {
            children = this.childExpr(nodeList.children);
        }

        let options: t.ObjectExpression | null = null;
        if (children) {
            options = t.objectExpression([
                t.objectProperty(t.identifier("children"), children),
            ]);
        }

        const args: t.Expression[] = [this.fragmentExpr()];
        if (options) {
            args.push(options);
        }

        return t.callExpression(
            t.memberExpression(t.identifier("r"), t.identifier("jsx")),
            args,
        );
    }

    childExpr(child: NonNullable<Child>): t.Expression {
        if (child.type === "ElementNode") {
            return this.elementExpr(child);
        }
        throw new Error(`Unreachable 4: ${child?.type}`);
    }

    elementExpr(element: ElementNode) {
        const { opening } = element;
        const args = [t.stringLiteral(opening.name.value)];
        // if (attributes) {
        //     args.push(t.objectExpression(
        //         attributes.map((attr) => this.attributeExpr(attr)),
        //     ));
        // }
        // if (children) {
        //     args.push(this.nodeListExpr(children));
        // }
        return t.callExpression(
            t.memberExpression(t.identifier("r"), t.identifier("jsx")),
            args,
        );
    }

    fragmentExpr() {
        return t.memberExpression(t.identifier("r"), t.identifier("Fragment"));
    }
}
