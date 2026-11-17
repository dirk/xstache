<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Console\OutputStyle;
use Illuminate\Container\Container;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Testing\Concerns\TestViews;
use Override;
use PHPUnit\Framework\MockObject\MockObject;
use Spatie\Snapshots\MatchesSnapshots;
use SplFileInfo;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Filesystem\Path;
use Xstache\Html\Context;
use Xstache\Laravel\Compiler;
use Xstache\Laravel\ViewCacheCommand;

class ViewCacheCommandTest extends TestCase
{
    use MatchesSnapshots;
    use TestViews;

    protected string $cache_path = '';

    protected Filesystem $files;

    protected function setUp(): void
    {
        $_ENV['APP_BASE_PATH'] = __DIR__;

        parent::setUp();

        $this->cache_path = Path::join(__DIR__, 'cache');
        $this->files = new Filesystem();
        $this->files->deleteDirectory($this->cache_path);
        $this->files->ensureDirectoryExists($this->cache_path);
        $this->switchToCompiledViewPath($this->cache_path);
    }

    protected function tearDown(): void
    {
        $this->files->deleteDirectory($this->cache_path);

        parent::tearDown();
    }

    public function testRun(): void
    {
        $command = new ViewCacheCommand();
        $command->setLaravel($this->app);

        // Ensure we're starting with the blank slate in the cache that we expect.
        $this->assertEmpty($this->getAllCacheFiles());

        $input = new ArrayInput([]);
        $output = new BufferedOutput();
        $command->run($input, $output);

        // resources/views/test.xstache
        $test_compiled = 'f1b82fcfeed8418c2bcc6f3039f9614b.php';
        $this->assertEquals(
            [$test_compiled],
            $this->getAllCacheFiles(),
        );

        $test_template = $this->files->getRequire(Path::join($this->cache_path, $test_compiled));
        $this->assertEquals(
            "Hello world!\n",
            call_user_func($test_template, new Context([])),
        );
    }

    protected function getAllCacheFiles(): array
    {
        return array_map(
            fn(SplFileInfo $file) => Path::makeRelative(
                $file->getPathname(),
                $this->cache_path,
            ),
            $this->files->allFiles($this->cache_path),
        );
    }
}
