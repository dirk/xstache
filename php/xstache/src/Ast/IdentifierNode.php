<?php

declare(strict_types=1);

namespace Xstache\Ast;

class IdentifierNode implements Child
{
    public function __construct(
        public readonly string $value,
    ) {
    }
}
