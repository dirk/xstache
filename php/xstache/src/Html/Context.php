<?php

declare(strict_types=1);

namespace Xstache\Html;

class Context
{
    public function __construct(
        private $data,
    ) {
    }
}
