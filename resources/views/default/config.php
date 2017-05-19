<?php

$config = [];
$config['templates'] = [];
$config['templates'][] = [
	'view'	=>	'pages.plain-page',
	'name'	=>	'Plain page',
];

$config['templates'][] = [
	'view'				=>	'pages.contact-us',
	'name'				=>	'Contact us',
	'controller'		=>	'ContactController',
	'regions'		=>	[
			'contact-form'	=>	[
				'label' => 'Contact form',
				'id' => 'contact',
				'region' => 'contact',
			],
			'slideshow'	=>	[
				'label' => 'Slideshow',
				'id' => 'slideshow',
				'region' => 'slideshow',
			],
	],
];

$config['templates'][] = [
	'view'				=>	'listings',
	'name'				=>	'Listings',
	'controller'		=>	'ListingsController',
	'regions'		=>	[
			'listings'	=>	[
				'label' => 'Listing settings',
				'id' => 'listings',
				'region' => 'listings',
			],
	],
];

$config['templates'][] = [
	'view'				=>	'home',
	'name'				=>	'Home',
	'regions'		=>	[
			'home-data'	=>	[
				'label' => 'Home data',
				'id' => 'home_data',
				'region' => 'home_data',
			],
			'slideshow'	=>	[
				'label' => 'Slideshow',
				'id' => 'slideshow',
				'region' => 'slideshow',
			],			
			'listings'	=>	[
				'label' => 'Listing settings',
				'id' => 'listings',
				'region' => 'listings',
			],
	],
];
$config['templates'][] = [
	'view'				=>	'map',
	'name'				=>	'Map',
	'controller'		=>	'MapController',
	'regions'		=>	[
			'map'	=>	[
				'label'  => 'Map coordinates',
				'id' 	 => 'map',
				'region' => 'map',
			],
			'listings'	=>	[
				'label' => 'Listing settings',
				'id' => 'listings',
				'region' => 'listings',
			],
	],
];

$config['regions'] = [];
$config['regions']['contact'] = [
	'contact' => [
		'schema'	=>	'contact',
	]
];

$config['global'] = [
	'regions'	=>	[
		'contact-form'	=>	[
			'label' => 'Contact form',
			'id' => 'address',
			'regions' => 'contact',
		],
		'team'	=>	[
			'label' => 'Contact form',
			'id' => 'team',
			'regions' => 'team',
		],
	],
];

return $config;
