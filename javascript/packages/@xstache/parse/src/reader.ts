export class Location {
    public constructor(
        public readonly line: number,
        public readonly column: number,
    ) {}

    public toString(): string {
        return `${this.line}:${this.column}`;
    }
}

export default class StringReader {
    #index = 0;
    private line = 1;
    private column = 1;

    constructor(private readonly input: string) {}

    public get index(): number {
        return this.#index;
    }

    public get location(): Location {
        return new Location(this.line, this.column);
    }

    public peek(count: number = 1): string | undefined {
        if (this.eof()) {
            return undefined;
        }
        return count <= 1
            ? this.input[this.#index]
            : this.input.slice(this.#index, this.#index + count);
    }

    public read(): string | undefined {
        if (this.eof()) {
            return undefined;
        }
        const char = this.input[this.#index];
        if (char === "\n") {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        this.#index++;
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
        return this.#index >= this.input.length;
    }
}
