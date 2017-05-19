<?php

/*
|--------------------------------------------------------------------------
| Module Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for the module.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::group(['prefix' => 'master'], function() {
	Route::get('/', function() {
		dd('This is the Master module index page.');
	});
});

Route::group(array('prefix' => config('route.prefix')), function() {
	Route::get('{slug}', '\App\Http\Controllers\PageController@getView');
});