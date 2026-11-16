<?php

declare(strict_types=1);

namespace Xstache\Ast;

class NodeList implements Childful
{
    public function __construct(
        public readonly Child|array|null $children,
    ) {
    }

    public function getChildren(): Child|array|null
    {
        return $this->children;
    }
}
