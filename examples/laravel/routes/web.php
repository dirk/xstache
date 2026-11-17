<?php

use Illuminate\Container\Container;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Container $app) {
    return view('test');
    // return view('welcome');
});
