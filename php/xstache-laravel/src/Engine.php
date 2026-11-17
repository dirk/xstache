<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\Contracts\View\Engine as EngineInterface;
use Illuminate\Filesystem\Filesystem;
use Xstache\Html\Context;

class Engine implements EngineInterface
{
    public function __construct(
        protected readonly Compiler $compiler,
        protected readonly Filesystem $files,
    ) {
    }

    /**
     * @param string $path
     * @param array $data
     * @return string
     */
    public function get($path, array $data = [])
    {
        if ($this->compiler->isExpired($path)) {
            $this->compiler->compile($path);
        }

        $compiled_path = $this->compiler->getCompiledPath($path);
        $template = $this->files->getRequire($compiled_path);
        return call_user_func($template, new Context($data));
    }
}
