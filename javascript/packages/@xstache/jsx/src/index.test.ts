import { expect, test } from "vitest";
import parse from "@xstache/parse";

import { compile } from "./index.js";

test("compile", () => {
    const nodeList = parse("<div>Hello {name}</div>");
    const result = compile(nodeList, { pretty: true });
    console.log(result);
    // console.log({ result });
});
