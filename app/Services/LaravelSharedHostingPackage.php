<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class LaravelSharedHostingPackageServiceProvider extends ServiceProvider
{
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    protected function baseDir()
    {
        return __DIR__ . '/..';
    }

    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {

        // Extends Url Generator
        $this->app->bind('url', function ($app) {
            return new \App\Support\UrlGenerator(
                $app['router']->getRoutes(),
                $app['request']
            );
        });
    }
}
