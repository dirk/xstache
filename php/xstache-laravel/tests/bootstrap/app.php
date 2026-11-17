<?php

use Illuminate\Foundation\Application;
use Xstache\Laravel\ServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([ServiceProvider::class])
    ->create();
