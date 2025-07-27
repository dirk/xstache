<?php

declare(strict_types=1);

namespace Xstache\Ast;

class KeyNode
{
    public function __construct(
        public readonly string $value,
    ) {
    }
}
