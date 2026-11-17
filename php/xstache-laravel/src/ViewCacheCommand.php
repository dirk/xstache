<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\Console\OutputStyle;
use Illuminate\Console\View\Components\Factory;
use Symfony\Component\Console\Attribute\AsCommand;
use Illuminate\Foundation\Console\ViewCacheCommand as BladeViewCacheCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

#[AsCommand(name: 'xstache:view:cache')]
class ViewCacheCommand extends BladeViewCacheCommand
{
    public const NAME = 'xstache:view:cache';

    protected $signature = self::NAME;

    protected $description = "Compile all of the application's Xstache templates";

    protected static $is_calling_from_event = false;

    public static function whileCallingFromEvent(callable $fn): void
    {
        static::$is_calling_from_event = true;
        call_user_func($fn);
        static::$is_calling_from_event = false;
    }

    public function handle()
    {
        if (static::$is_calling_from_event) {
            $this->components->info(sprintf(
                'Also automatically caching Xstache templates. Set %s in the Laravel config to false to disable this.',
                ServiceProvider::CONFIG_CACHE_ON_VIEW_CACHE_COMMAND,
            ));
        }

        $compiler = $this->laravel->make('xstache.compiler');

        $this->paths()->each(function ($path) use ($compiler) {
            $prefix = $this->output->isVeryVerbose() ? '<fg=yellow;options=bold>DIR</> ' : '';
            $output = '';
            $this->components->task($prefix.$path, function () use ($compiler, $path, &$output) {
                $output = $this->compilePath($path, $compiler);
            }, OutputInterface::VERBOSITY_VERBOSE);

            if ($this->output->isVeryVerbose()) {
                $this->output->write($output);
            }
        });

        $this->newLine();

        $this->components->info('Xstache templates cached successfully.');
    }

    protected function compilePath(string $path, Compiler $compiler): string
    {
        $buffered = new BufferedOutput(
            $this->output->getVerbosity(),
            $this->output->isDecorated(),
            $this->output->getFormatter(),
        );
        $output = new OutputStyle(new ArrayInput([]), $buffered);
        $components = new Factory($output);

        $files = Finder::create()
            ->in([$path])
            ->exclude('vendor')
            ->name(['*.xstache'])
            ->files();

        foreach ($files as $file) {
            $components->task('    '.$file->getRelativePathname(), fn() => $compiler->compile($file->getRealPath()));
        }
        $output->newLine();

        return $buffered->fetch();
    }
}
