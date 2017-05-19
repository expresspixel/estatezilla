<?php namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyType;
use App\Models\SearchCriteriaType;
use DB;
use Config;
use Input;
use Request;
use Response;
use Redirect;
use Session;
use View;

class MapController extends ListingsController {

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
	
    function getIndex($page = null) {
		
		$preset_data = [];
		if(isset($page->regions_data)) {
			$preset_data = $page->regions_data;	
		}
		
        $lang = Config::get( 'app.locale' );

        $vars = Input::get();
		if(isset($preset_data['listings'])) {
			foreach($preset_data['listings'] as $param_key => $param_value) {
				if(!isset($vars[$param_key])) {
					$vars[$param_key] = $param_value;
				}
			}
		}
		
        $data = array();
        $filters = $this->getFilters();
        foreach($filters as $filter => $values) {
            $data[$filter] = $values;
        }
		
		$map = ['lat' => 0, 'lng' => 0,  'zoom' => 9];
		if(isset($page->regions_data['map'])) {
			$map = $page->regions_data['map'];	
			$map->lat = (float) $map->lat;	
			$map->lng = (float) $map->lng;	
			$map->zoom = (int) $map->zoom;	
		}
		
        $data['map'] = $map;
        $data['properties'] = $properties;
        $data['vars'] = $vars;
		
        Session::put('last_search.query', $vars);
        #Session::put('last_search.type', $listing_type);
		
		return view('pages.map', $data);
	}
	
	function getProperties() {
		$vars = Input::get();
		list($properties, $vars) = $this->searchProperties($vars);
		$data = [];
		$data['properties'] = $properties->get();
		$data['status'] = true;
		return $data;
	}

}
