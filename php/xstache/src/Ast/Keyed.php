<?php

declare(strict_types=1);

namespace Xstache\Ast;

interface Keyed
{
    /** @return KeyNode[] */
    public function getKey(): array;
}
