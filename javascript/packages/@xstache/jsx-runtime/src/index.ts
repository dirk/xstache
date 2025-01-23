interface JsxRuntime {
    jsx(type: any, props: unknown, key?: any): any;
    jsxs(type: any, props: unknown, key?: any): any;
    Fragment: any;
}

class Context {
    constructor(private readonly data: any) {}

    public v(...keys: string[]) {
        let value = this.data;
        for (const key of keys) {
            const next = value[key];
            if (next) {
                value = next;
            } else {
                return undefined;
            }
        }
        return value;
    }
}

export interface CodeObject {
    xs: Function;
}

export class Template {
    constructor(private readonly compiled: CodeObject) {}

    public render(jsxRuntime: JsxRuntime, data: any) {
        return this.compiled.xs(jsxRuntime, new Context(data));
    }
}
