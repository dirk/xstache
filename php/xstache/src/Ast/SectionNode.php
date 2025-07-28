<?php

declare(strict_types=1);

namespace Xstache\Ast;

class SectionNode implements Child
{
    public function __construct(
        public readonly SectionOpeningNode $opening,
        public readonly SectionClosingNode $closing,
        public readonly Child|array|null $children,
    ) {
    }
}
