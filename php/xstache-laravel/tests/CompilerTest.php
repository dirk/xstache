<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Filesystem\Filesystem;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Mockery\MockInterface;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;
use Xstache\Laravel\Compiler;

class CompilerTest extends TestCase
{
    use MockeryPHPUnitIntegration;
    use MatchesSnapshots;

    public function testCompile(): void
    {
        $compiler = new Compiler($files = self::getFiles(), 'cache');
        $files->allows([
            'get' => '<b>Hello world!</b>',
        ]);
        $files->expects()->exists('cache')->andReturns(true);
        $compiled_path = 'cache/0c570cf75585d105a45c4cfe4abc58d6.php';
        $files->expects()->exists($compiled_path)->andReturns(true);
        $files->expects()->hash($compiled_path, 'md5')->andReturns('');
        $target = '';
        $files->expects()->replace($compiled_path, Mockery::capture($target));

        $compiler->compile('path.xstache');

        $this->assertMatchesTextSnapshot($target);
    }

    protected static function getFiles(): Filesystem|MockInterface
    {
        return Mockery::mock(Filesystem::class);
    }
}
