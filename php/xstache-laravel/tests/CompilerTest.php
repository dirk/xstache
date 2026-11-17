<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Filesystem\Filesystem;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;
use Xstache\Laravel\Compiler;

class CompilerTest extends TestCase
{
    use MockeryPHPUnitIntegration;
    use MatchesSnapshots;

    private const PATH = 'path.xstache';
    private const CACHE_PATH = 'cache';
    private const COMPILED_PATH = 'cache/0c570cf75585d105a45c4cfe4abc58d6.php';

    public function testCompileNew(): void
    {
        $compiler = new Compiler($files = $this->getFiles(), self::CACHE_PATH);

        $files
            ->method('exists')
            ->willReturnMap([
                [self::CACHE_PATH, true],
                [self::COMPILED_PATH, false],
            ]);

        $target = '';
        $files
            ->expects($this->once())
            ->method('replace')
            ->with(self::COMPILED_PATH, $this->callback(function ($content) use (&$target) {
                $target = $content;
                return true;
            }));

        $compiler->compile(self::PATH);

        $this->assertMatchesTextSnapshot($target);
    }

    public function testCompileNewHash(): void
    {
        $compiler = new Compiler($files = $this->getFiles(), self::CACHE_PATH);

        $files
            ->method('exists')
            ->willReturnMap([
                [self::CACHE_PATH, true],
                [self::COMPILED_PATH, true],
            ]);

        $files
            ->expects($this->once())
            ->method('hash')
            ->with(self::COMPILED_PATH, 'md5')
            ->willReturn('old hash');

        $target = '';
        $files
            ->expects($this->once())
            ->method('replace')
            ->with(self::COMPILED_PATH, $this->callback(function ($content) use (&$target) {
                $target = $content;
                return true;
            }));

        $compiler->compile(self::PATH);
    }

    public function testCompileNoOpOnEmpty(): void
    {
        $compiler = new Compiler($files = $this->getFiles(), self::CACHE_PATH);

        $files
            ->expects($this->never())
            ->method('get');

        $compiler->compile(null);
        $compiler->compile('');
    }

    protected function getFiles(): Filesystem|MockObject
    {
        $files = $this->createMock(Filesystem::class);
        $files
            ->method('get')
            ->willReturnMap([
                [self::PATH, '<b>Hello world!</b>'],
            ]);
        return $files;
    }
}
