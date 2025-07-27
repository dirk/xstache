import { describe, test, expect } from "vitest";

import { Template } from "./index";

describe("Template", () => {
    describe("render", () => {
        test("text content", () => {
            const template = new Template((context, buffer) => {
                buffer.push("Hello World");
            });
            const result = template.render({});
            expect(result).toMatchInlineSnapshot(`"Hello World"`);
        });

        test("data interpolation", () => {
            const template = new Template((context, buffer) => {
                const name = context.value(["name"]);
                buffer.push(`Hello ${name}`);
            });
            const result = template.render({ name: "John" });
            expect(result).toMatchInlineSnapshot(`"Hello John"`);
        });

        test("HTML elements", () => {
            const template = new Template((context, buffer) => {
                context.element(
                    "div",
                    { class: "container" },
                    () => {
                        buffer.push("Content");
                    },
                    buffer,
                );
            });
            const result = template.render({});
            expect(result).toMatchInlineSnapshot(
                `"<div class="container">Content</div>"`,
            );
        });

        test("self-closing elements", () => {
            const template = new Template((context, buffer) => {
                context.element(
                    "img",
                    { src: "image.jpg", alt: "Image" },
                    undefined,
                    buffer,
                );
            });
            const result = template.render({});
            expect(result).toMatchInlineSnapshot(
                `"<img src="image.jpg" alt="Image" />"`,
            );
        });

        test("nested elements", () => {
            const template = new Template((context, buffer) => {
                context.element(
                    "div",
                    { id: "main" },
                    () => {
                        context.element(
                            "h1",
                            {},
                            () => {
                                buffer.push("Title");
                            },
                            buffer,
                        );
                        context.element(
                            "p",
                            {},
                            () => {
                                buffer.push("Paragraph content");
                            },
                            buffer,
                        );
                    },
                    buffer,
                );
            });
            const result = template.render({});
            expect(result).toMatchInlineSnapshot(
                `"<div id="main"><h1>Title</h1><p>Paragraph content</p></div>"`,
            );
        });

        test("sections", () => {
            const template = new Template((context, buffer) => {
                context.element(
                    "ul",
                    {},
                    () => {
                        context.section(["items"], (itemContext) => {
                            context.element(
                                "li",
                                {},
                                () => {
                                    const name = itemContext.value(["name"]);
                                    buffer.push(name);
                                },
                                buffer,
                            );
                        });
                    },
                    buffer,
                );
            });
            const result = template.render({
                items: [
                    { name: "Item 1" },
                    { name: "Item 2" },
                    { name: "Item 3" },
                ],
            });
            expect(result).toMatchInlineSnapshot(
                `"<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"`,
            );
        });

        test("conditional attributes", () => {
            const template = new Template((context, buffer) => {
                const isActive = context.value(["active"]);
                const className = isActive ? "active" : null;

                context.element(
                    "button",
                    {
                        type: "button",
                        class: className,
                        disabled: context.value(["disabled"]),
                    },
                    () => {
                        buffer.push("Click me");
                    },
                    buffer,
                );
            });

            const result1 = template.render({ active: true, disabled: false });
            expect(result1).toMatchInlineSnapshot(
                `"<button type="button" class="active">Click me</button>"`,
            );

            const result2 = template.render({ active: false, disabled: true });
            expect(result2).toMatchInlineSnapshot(
                `"<button type="button" disabled>Click me</button>"`,
            );
        });

        test("attributes with escaped content", () => {
            const template = new Template((context, buffer) => {
                context.element(
                    "div",
                    { title: context.value(["title"]) },
                    () => {
                        buffer.push(context.value(["content"]));
                    },
                    buffer,
                );
            });
            const result = template.render({
                title: '<strong>Hello "World"</strong>',
                content: '<script>alert("XSS!");</script>',
            });
            expect(result).toMatchInlineSnapshot(
                `"<div title="&lt;strong&gt;Hello &quot;World&quot;&lt;/strong&gt;"><script>alert("XSS!");</script></div>"`,
            );
        });

        test("handles missing data gracefully", () => {
            const template = new Template((context, buffer) => {
                const name = context.value(["user", "name"]) || "Anonymous";
                buffer.push(`Hello ${name}`);
            });
            const result = template.render({});
            expect(result).toMatchInlineSnapshot(`"Hello Anonymous"`);
        });
    });
});
