import type { Plugin } from "rollup";
import { createFilter, type FilterPattern } from "@rollup/pluginutils";
import parse from "@xstache/parse";
import { compileToString as compileToStringHtml } from "@xstache/html";
import { compileToString as compileToStringJsx } from "@xstache/jsx";

type NodeList = ReturnType<typeof parse>;

interface Options {
    include?: FilterPattern;
    exclude?: FilterPattern;
}

function pluginFactory(
    name: string,
    options: Options,
    transform: (nodeList: NodeList) => string,
): Plugin {
    const ext = /\.xstache$/;
    const filter = createFilter(options.include, options.exclude);

    return {
        name,
        transform(code, id) {
            if (!ext.test(id) || !filter(id)) {
                return null;
            }

            const nodeList = parse(code);
            return transform(nodeList);
        },
    };
}

export const xstacheHtml = (options: Options = {}) =>
    pluginFactory("xstache-html", options, (nodeList) =>
        compileToStringHtml(nodeList, {
            module: true,
        }),
    );

export const xstacheJsx = (options: Options = {}) =>
    pluginFactory("xstache-jsx", options, (nodeList) =>
        compileToStringJsx(nodeList, {
            module: true,
            pretty: true,
        }),
    );
