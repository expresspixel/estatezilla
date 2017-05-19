<?php namespace App\Http\Routes;

use App\Models\Page;
use App\Models\PageTranslation;
use LaravelBA\RouteBinder\RouteBinder;
use Illuminate\Contracts\Routing\Registrar;
use Config;
use Lang;
use App\Models\Locale;
use App;
use Request;
use DB;

class PageRouteBinder implements RouteBinder
{

    public function bind(Registrar $router)
    {

		try{
			$locales = Locale::where('visible', 1)->get();
		}catch(\Exception $e){
			return;
		}

        $locales = Locale::where('visible', 1)->get();
        $available_locales = [];
        foreach($locales as $locale) {
            $available_locales[$locale->code] = $locale->name;
        }
        Config::set('app.available_locales', array_keys($available_locales));
        $locales = Config::get('app.available_locales');
        //dd($locales);
        $locale = Request::segment(1);

        if(in_array($locale, $locales)){
            App::setLocale($locale);
        }else{

            if(isset($_COOKIE['lang'])) {
                App::setLocale($_COOKIE['lang']);
            } else {
                App::setLocale(Config::get('app.locale'));
            }

            if(count($locales) == 1) {
                $locale = '';
            } else {
                $locale = App::getLocale();
            }

        }

        if(count($locales) == 1) {
            $prefix = '/';
        } else {
            $prefix = $locale.'/';
        }
        $current_locale = Config::get( 'app.locale' );

        //Page routes
        $pages = Page::lists('handler', 'id');
        $page_translations = PageTranslation::where('locale', $current_locale)->lists('slug', 'page_id');
        #dd($page_translations);

        $page_routes = [];
        foreach($page_translations as $page_id => $page_slug) {
            if($pages[$page_id])
                $page_routes[$pages[$page_id]] = $page_slug;
        }
        $locales = Config::get('app.available_locales');
        #dd($page_routes);
        #dd($page_routes);
        foreach($page_routes as $page_route => $page_slug) {
            #echo $page_route.$page_slug."/{:all?}";echo "<br />";
            #echo $prefix.$page_slug."/{path?}";echo $page_route;echo "<br />";
            $router->any($prefix.$page_slug."/{path?}", array('as' => $page_route, 'uses' => '\App\Http\Controllers\PageController@getPageView'));
        }

    }
}
