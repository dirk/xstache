export interface CodeObject {
    xs: Function;
}

export class Template {
    constructor(private readonly compiled: CodeObject) {}

    public render() {
        this.compiled.xs();
    }
}
