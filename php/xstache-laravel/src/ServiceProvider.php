<?php

declare(strict_types=1);

namespace Xstache\Laravel;

use Illuminate\Container\Container;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider as BaseServiceProvider;

class ServiceProvider extends BaseServiceProvider
{
    public function boot(): void
    {
        $this->registerCompiler();
        $this->registerExtension();
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
                    $app->make('files'),
                );
            },
        );
    }
}
