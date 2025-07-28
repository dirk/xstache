<?php

declare(strict_types=1);

namespace Xstache\Ast;

class NodeList
{
    public function __construct(
        public readonly Child|array|null $children,
    ) {
    }
}
