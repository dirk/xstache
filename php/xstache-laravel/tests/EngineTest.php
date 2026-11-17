<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Filesystem\Filesystem;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Mockery\MockInterface;
use PHPUnit\Framework\TestCase;
use Xstache\Laravel\Compiler;
use Xstache\Laravel\Engine;

class EngineTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    public function testGetExpired(): void
    {
        $engine = new Engine(
            $compiler = Mockery::mock(Compiler::class),
            $files = self::getFiles(),
        );
        assert($compiler instanceof MockInterface);

        $path = 'path.xstache';
        $compiled_path = 'cache/path.php';
        $compiler->expects()->isExpired($path)->andReturns(true);
        $compiler->expects()->compile($path);
        $compiler->expects()->getCompiledPath($path)->andReturns($compiled_path);

        $output = 'Mocked!';
        $template = Mockery::spy(fn() => $output);
        $files->expects()->getRequire($compiled_path)->andReturns($template);

        $this->assertEquals($output, $engine->get($path));
    }

    protected static function getFiles(): Filesystem|MockInterface
    {
        return Mockery::mock(Filesystem::class);
    }
}
