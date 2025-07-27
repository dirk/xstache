<?php

declare(strict_types=1);

namespace Xstache;

class SourceLocation
{
    public function __construct(
        public readonly int $line,
        public readonly int $column,
    ) {
    }

    public function __toString(): string
    {
        return sprintf('%d:%d', $this->line, $this->column);
    }
}
