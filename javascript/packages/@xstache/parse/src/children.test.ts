import { expect, test } from "vitest";

import children from "./children.js";
import StringReader from "./reader.js";

test("errors on attributes in closing tags", () => {
    const reader = new StringReader("<div></div class>");
    expect(() => children(reader)).toThrowErrorMatchingInlineSnapshot(
        `[Error: Expected '>', got 'c' at 1:12]`,
    );
});
