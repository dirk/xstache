<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\Console\Events\CommandFinished;
use Illuminate\Container\Container;
use Illuminate\Support\Facades\{Artisan, Config, Event, View};
use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Symfony\Component\Console\Command\Command;

class ServiceProvider extends BaseServiceProvider
{
    public const CONFIG_CACHE_ON_VIEW_CACHE_COMMAND = 'xstache.cache_on_view_cache_command';

    public function boot(): void
    {
        $this->registerCompiler();
        $this->registerExtension();
        $this->registerViewCacheCommand();
    }

    public function registerCompiler(): void
    {
        $this->app->singleton('xstache.compiler', function ($app) {
            return new Compiler(
                $app['files'],
                $app['config']['view.compiled'],
                $app['config']->get('view.relative_hash', false) ? $app->basePath() : '',
                $app['config']->get('view.cache', true),
                $app['config']->get('view.compiled_extension', 'php'),
                $app['config']->get('view.check_cache_timestamps', true),
            );
        });
    }

    public function registerExtension(): void
    {
        View::addExtension(
            'xstache',
            'xstache',
            function () {
                $app = Container::getInstance();
                return new Engine(
                    $app->make('xstache.compiler'),
                    /** @phan-suppress-next-line PhanTypeMismatchArgument */
                    $app->make('files'),
                );
            },
        );
    }

    public function registerViewCacheCommand(): void
    {
        if (!$this->app->runningInConsole()) {
            return;
        }

        $this->commands([
            ViewCacheCommand::class,
        ]);

        if (Config::get(self::CONFIG_CACHE_ON_VIEW_CACHE_COMMAND, true)) {
            Event::listen(CommandFinished::class, function (CommandFinished $event) {
                if ($event->command === 'view:cache' && $event->exitCode === Command::SUCCESS) {
                    ViewCacheCommand::whileCallingFromEvent(
                        fn() => Artisan::call(ViewCacheCommand::NAME, [], $event->output),
                    );
                }
            });
        }
    }
}
