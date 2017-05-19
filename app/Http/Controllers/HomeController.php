<?php namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyType;
use App\Models\PageTranslation;
use App\Models\Region;
use Session;
use Input;
use Response;
use Config;
use DB;

class HomeController extends SiteController {

	/*
	|--------------------------------------------------------------------------
	| Home Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders your application's "dashboard" for users that
	| are authenticated. Of course, you are free to change or remove the
	| controller as you wish. It is just here to get your app started!
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
    /**
     * Inject the models.
     */
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
        $data = array();
        $filters = $this->getFilters();
        foreach($filters as $filter => $values) {
            $data[$filter] = $values;
        }
		
        return view('home', $data);
    }

}
