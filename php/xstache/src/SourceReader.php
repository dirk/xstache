<?php

declare(strict_types=1);

namespace Xstache;

class SourceReader
{
    private int $index = 0;
    private int $line = 1;
    private int $column = 1;

    public function __construct(
        private readonly string $input,
    ) {
    }

    public function location(): SourceLocation
    {
        return new SourceLocation($this->line, $this->column);
    }

    public function peek(int $count = 1): string|null
    {
        if ($this->eof()) {
            return null;
        }
        return $count === 1
            ? $this->input[$this->index]
            : substr($this->input, $this->index, $count);
    }

    public function read(): string | null
    {
        if ($this->eof()) {
            return null;
        }
        $char = $this->input[$this->index];
        $this->index++;
        if ($char === "\n") {
            $this->line++;
            $this->column = 1;
        } else {
            $this->column++;
        }
        return $char;
    }

    public function readWhile(callable $predicate): string
    {
        $result = '';
        while (!$this->eof() && $predicate($this->input[$this->index])) {
            $result .= $this->read();
        }
        return $result;
    }

    public function eof(): bool
    {
        return $this->index >= strlen($this->input);
    }
}
