<?php

declare(strict_types=1);

namespace Xstache\Ast;

class SectionOpeningNode implements Keyed
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
