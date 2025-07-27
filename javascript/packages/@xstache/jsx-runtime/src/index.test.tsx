import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { describe, test, expect } from "vitest";

import { componentFactory } from "./index";

describe("componentFactory", () => {
    test("creates a component function", () => {
        const Component = componentFactory(
            (context) => context.value(["name"]),
            jsxRuntime,
        );
        const element = <Component name="John" />;
        expect(renderToString(element)).toMatchInlineSnapshot(`"John"`);
    });

    test("handles nested contexts", () => {
        const Component = componentFactory(
            (context, jsxRuntime) =>
                context.section(
                    ["items"],
                    (context, index) => (
                        <span key={index}>{context.value(["name"])}</span>
                    ),
                    jsxRuntime,
                ),
            jsxRuntime,
        );
        const element = (
            <Component items={[{ name: "Item 1" }, { name: "Item 2" }]} />
        );
        expect(renderToString(element)).toMatchInlineSnapshot(
            `"<span>Item 1</span><span>Item 2</span>"`,
        );
    });
});
