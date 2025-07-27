<?php

declare(strict_types=1);

namespace Xstache\Ast;

class ElementNode implements Child
{
    public function __construct(
        public readonly ElementOpeningNode $opening,
        // public readonly ?ElementClosingNode $closing,
        public readonly Child|array|null $children = [],
    ) {
    }
}
