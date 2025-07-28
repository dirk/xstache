<?php

declare(strict_types=1);

namespace Xstache\Ast;

class ElementOpeningNode
{
    public function __construct(
        public readonly IdentifierNode $name,
        public readonly array $attributes,
        public readonly bool $self_closing,
    ) {
    }
}
