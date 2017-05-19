<?php
namespace App\Modules\Master\Providers;

use App;
use Config;
use Lang;
use View;
use Illuminate\Support\ServiceProvider;

class MasterServiceProvider extends ServiceProvider
{
	/**
	 * Register the Master module service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		// This service provider is a convenient place to register your modules
		// services in the IoC container. If you wish, you may make additional
		// methods or service providers to keep the code more focused and granular.
		App::register('App\Modules\Master\Providers\RouteServiceProvider');

		$this->registerNamespaces();
	}

	/**
	 * Register the Master module resource namespaces.
	 *
	 * @return void
	 */
	protected function registerNamespaces()
	{
		Lang::addNamespace('master', realpath(__DIR__.'/../Resources/Lang'));

		View::addNamespace('master', realpath(__DIR__.'/../Resources/Views'));
	}
}
