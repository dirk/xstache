<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\Contracts\View\Engine as EngineContract;
use Illuminate\Filesystem\Filesystem;

class Engine implements EngineContract
{
    public function __construct(
        protected readonly Compiler $compiler,
        protected readonly Filesystem $files,
    ) {
        throw new \Exception('Not implemented');
    }

    /**
        *
        * @param string $path
        * @param array $data
        * @return string
        */
    public function get($path, array $data = [])
    {
        return '';
    }
}
