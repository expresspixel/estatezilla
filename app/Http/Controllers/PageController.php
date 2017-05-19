<?php namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\PropertyType;
use App\Models\Region;
use View;
use Session;
use Config;
use App;
use Request;
use Route;
use Input;
use Theme;
use Response;

class PageController extends App\Http\Controllers\SiteController {

    public function __construct()
    {
        parent::__construct();
    }
	/**
	 * Returns all the blog posts.
	 *
	 * @return View
	 */
	public function getIndex()
	{
		return;
	}

	/**
	 * View a blog post.
	 *
	 * @param  string  $slug
	 * @return View
	 * @throws NotFoundHttpException
	 */
	public function getPageView($slug = null) {
        $locale = Config::get( 'app.locale' );
        $slug = Route::currentRouteName();
        $page = Page::where('handler', '=', $slug)->first();
        if($page) {
            $translation = PageTranslation::where('page_id', '=', $page->id)
                ->where('locale', '=', $locale)
                ->first();
            if($translation) {
                $slug = $translation->slug;
            }
        }
        return $this->getView($slug);
    }

	private function getThemeConfig($theme) {
        $theme_settings_file = base_path("resources/views/".$theme."/config.php");
        $theme_settings = false;
        if(file_exists($theme_settings_file)) {
            $theme_settings = include $theme_settings_file;
        }
        return $theme_settings;
    }

	public function getView($slug = null)
	{

		$locale = Config::get( 'app.locale' );
		if (is_null($this->translation)) {
			return App::abort(404);
		}
		if($this->translation->visibility == 'HIDDEN') {
			return Response::view('error.403', array('message' => 'Sorry, this page is currently unavailable.'), 403);
		}

        $page = $this->page;
		$theme = Theme::get();
		$theme_config = $this->getThemeConfig($theme);
		$page_types = [];
		foreach($theme_config['templates'] as $template) {
			if(isset($template['controller'])) {
				$page_types[$template['view']] = ['controller' => $template['controller']];
			}
		}



		$data = [];
		$data['page'] = $page;

        if($page->template != 'page') {
            if(isset($page_types[$page->template])) {
				$controller = 'App\Http\Controllers\\PageController';
				if(isset($page_types[$page->template]['controller'])) {
					$controller = 'App\Http\Controllers\\' . $page_types[$page->template]['controller'];
				}
				$regions = Region::where('page_id', $page->id)->get();
				$regions_data = [];
				foreach($regions as $region) {
					$regions_data[$region['handler']] = $region['value'];
				}
				$page->regions_data = $regions_data;
				#dd($controller);
				if (Request::isMethod('post')) {
					return App::make($controller)->postIndex();
				} else {
					return App::make($controller)->getIndex($page);
				}
            }
        } elseif ($page->template && View::exists('pages.'.$page->template.'')) {
			return view('pages.'.$page->template.'', $data);
		}

		// Show the page
		return view('pages.plain-page', $data);
	}

}
