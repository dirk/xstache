#!/usr/bin/env node
import cli from "@xstache/cli";

import { compileToString } from "./index.js";

cli(
    (nodeList) =>
        compileToString(nodeList, {
            module: true,
        }),
    "js",
);
