<?php

declare(strict_types=1);

namespace Xstache\Ast;

class VariableNode implements Child, Keyed
{
    public function __construct(
        public readonly array $key,
    ) {
    }

    public function getKey(): array
    {
        return $this->key;
    }
}
