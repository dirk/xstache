<?php

declare(strict_types=1);

namespace Xstache\Ast;

class ElementClosingNode
{
    public function __construct(
        public readonly IdentifierNode $name,
    ) {
    }
}
