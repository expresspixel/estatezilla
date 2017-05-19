<?php namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Config;
use Module;
use File;
use Theme;

class BootableServiceProvider extends ServiceProvider {

	/**
	 * Bootstrap the application services.
	 *
	 * @return void
	 */
	public function boot()
	{
		//

	}

	/**
	 * Register the application services.
	 *
	 * @return void
	 */
	public function register()
	{

		//get the default theme
		foreach(File::directories(app_path('Modules')) as $module) {
			$sourceDir = $module.'\Assets';
			$destinationDir = public_path('themes/default/modules/'.basename($module));
			if (File::exists($sourceDir) && !File::exists($destinationDir)) {
				$success = File::copyDirectory($sourceDir, $destinationDir);
			}
		}		
	}

}
