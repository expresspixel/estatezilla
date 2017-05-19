<?php
return [
    /**
     * Put all your route binder classes here.
     * The ServiceProvider will use the IoC container to instantiate them
     * and call the `bind()` method on each of them.
     *
     * Example (with suggested php5.5 syntax):
     *
     * 'binders' = [
     *      App\Http\Routes\HomeRouteBinder::class,
     *      App\Http\Routes\FooRouteBinder::class,
     * ]
     */
    'binders' => [
        'App\Http\Routes\PageRouteBinder',
    ]
];