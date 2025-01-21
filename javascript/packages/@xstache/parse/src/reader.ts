export default class StringReader {
    private index = 0;

    constructor(private readonly input: string) {}

    public peek(): string | undefined {
        if (this.eof()) {
            return undefined;
        }
        return this.input[this.index];
    }

    public read(): string | undefined {
        if (this.eof()) {
            return undefined;
        }
        const char = this.input[this.index];
        this.index++;
        return char;
    }

    public readWhile(predicate: (char: string) => boolean): string {
        let result = "";
        while (!this.eof() && predicate(this.peek()!)) {
            result += this.read()!;
        }
        return result;
    }

    public eof(): boolean {
        return this.index >= this.input.length;
    }
}
