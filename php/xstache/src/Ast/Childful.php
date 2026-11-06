<?php

declare(strict_types=1);

namespace Xstache\Ast;

interface Childful
{
    public function getChildren(): Child|array|null;
}
