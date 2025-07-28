<?php

declare(strict_types=1);

namespace Xstache\Ast;

class SectionClosingNode
{
    public function __construct(
        public readonly array $key,
    ) {
    }
}
