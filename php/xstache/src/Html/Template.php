<?php

declare(strict_types=1);

namespace Xstache\Html;

class Template
{
    public function __construct(
        private $implementation,
    ) {
    }

    public function render(
        array $data = [],
    ): string {
        $context = new Context($data);
        return ($this->implementation)($context);
    }
}
