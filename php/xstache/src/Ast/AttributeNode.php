<?php

declare(strict_types=1);

namespace Xstache\Ast;

class AttributeNode
{
    public function __construct(
        public readonly IdentifierNode $name,
        public readonly VariableNode|null $value,
    ) {
    }
}
