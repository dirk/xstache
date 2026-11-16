<?php

declare(strict_types=1);

namespace Xstache\Ast;

interface Childful
{
    /** @return Child|Child[]|null */
    public function getChildren(): Child|array|null;
}
