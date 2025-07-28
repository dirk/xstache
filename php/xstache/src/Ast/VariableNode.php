<?php

declare(strict_types=1);

namespace Xstache\Ast;

class VariableNode implements Child
{
    public function __construct(
        public readonly array $key,
    ) {
    }
}
