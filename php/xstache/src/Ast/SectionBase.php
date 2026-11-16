<?php

declare(strict_types=1);

namespace Xstache\Ast;

abstract class SectionBase implements Child, SectionLike
{
    public function __construct(
        public readonly SectionOpeningNode $opening,
        public readonly SectionClosingNode $closing,
        public readonly Child|array|null $children,
    ) {
    }

    public function getKey(): array
    {
        return $this->opening->getKey();
    }

    public function getChildren(): Child|array|null
    {
        return $this->children;
    }
}
