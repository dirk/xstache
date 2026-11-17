<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\View\Compilers\Compiler as BaseCompiler;
use Illuminate\View\Compilers\CompilerInterface;
use Xstache\Html\Compile;
use Xstache\Parse;

class Compiler extends BaseCompiler implements CompilerInterface
{
    private const PREAMBLE = "<?php\n\n";

    private const ALGORITHM = 'md5';

    public function compile($path = null)
    {
        if (empty($path)) {
            return;
        }

        $source = $this->files->get($path);
        $node_list = Parse::parse($source);
        $target = self::PREAMBLE . Compile::compile($node_list);

        $compiled_path = $this->getCompiledPath($path);
        $this->ensureCompiledDirectoryExists($compiled_path);

        if (!$this->files->exists($compiled_path)) {
            $this->files->replace($compiled_path, $target);
            return;
        }

        $existing_hash = $this->files->hash($compiled_path, self::ALGORITHM);
        if (hash(self::ALGORITHM, $target) !== $existing_hash) {
            $this->files->replace($compiled_path, $target);
            return;
        }

        $source_last_modified = $this->files->lastModified($path);
        $existing_last_modified = $this->files->lastModified($compiled_path);
        if ($source_last_modified >= $existing_last_modified) {
            touch($compiled_path, $source_last_modified + 1);
        }
    }
}
