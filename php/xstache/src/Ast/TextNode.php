<?php

declare(strict_types=1);

namespace Xstache\Ast;

class TextNode implements Child
{
    public function __construct(
        public readonly string $value,
    ) {
    }
}
