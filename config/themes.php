<?php
$themes = [];
$themes['default'] = [
	'extends'	 	=> null,
	'asset-path' 	=> 'themes/default',
];

foreach(glob(base_path('resources/views/*')) as $file) {
	if(filetype($file) == 'dir' && basename($file) != 'default') {
		$themes[basename($file)] = [
			'extends'	 	=> 'default',
			'asset-path' 	=> 'themes/'.basename($file),
		];
	}
}

return [

	/*
	|--------------------------------------------------------------------------
	| Switch this package on/off. Usefull for testing...
	|--------------------------------------------------------------------------
	*/

	'enabled' => true,

	/*
	|--------------------------------------------------------------------------
	| Set behavior if an asset is not found in a Theme hierarcy.
	| Available options: THROW_EXCEPTION | LOG_ERROR | IGNORE
	|--------------------------------------------------------------------------
	*/

	'asset_not_found' => 'LOG_ERROR',

	/*
	|--------------------------------------------------------------------------
	| Set the Active Theme. Can be set at runtime with:
	|  Themes::set('theme-name');
	|--------------------------------------------------------------------------
	*/

	'active' => 'default',

	/*
	|--------------------------------------------------------------------------
	| Define available themes. Format:
	|
	| 	'theme-name' => [
	| 		'extends'	 	=> 'theme-to-extend',  // optional
	| 		'views-path' 	=> 'path-to-views',    // defaults to: resources/views/theme-name
	| 		'asset-path' 	=> 'path-to-assets',   // defaults to: public/theme-name
    |
    |		// you can add your own custom keys and retrieve them with Theme::config('key');
	| 	],
	|
	|--------------------------------------------------------------------------
	*/

	'themes' => $themes,

];
