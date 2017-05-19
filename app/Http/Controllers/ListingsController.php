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

class ListingsController extends SiteController {
    
    private $message;

    /**
     * Inject the models.
     */
    public function __construct()
    {
        parent::__construct();
    }

    protected function restrictLocation($properties) {
        $this->message = '';
        $radius = 1; // in miles
        if(Input::get('radius'))
            $radius = Input::get('radius');

        if(Input::get('bounds')) {
            $bounds = Input::get('bounds');
            list($north, $east, $south, $west) = explode(",", $bounds);

            if($radius > 1) {
                $longitude = (float) Input::get('lng');
                $latitude = (float) Input::get('lat');

                #dd($radius);
                $east = $longitude - $radius / abs(cos(deg2rad($latitude)) * 69);
                $west = $longitude + $radius / abs(cos(deg2rad($latitude)) * 69);
                $north = $latitude - ($radius / 69);
                $south = $latitude + ($radius / 69);
            }

        } elseif(Input::get('lng') && Input::get('lat')) {
            $longitude = (float) Input::get('lng');
            $latitude = (float) Input::get('lat');

            #dd($radius);
            $east = $longitude - $radius / abs(cos(deg2rad($latitude)) * 69);
            $west = $longitude + $radius / abs(cos(deg2rad($latitude)) * 69);
            $north = $latitude - ($radius / 69);
            $south = $latitude + ($radius / 69);
        } elseif(Input::get('bounds_url')) {
            $bounds = rawurldecode(Input::get('bounds_url'));
            list($north, $east, $south, $west) = explode(",", $bounds);
        } elseif(Input::get('location')) {
            $place = Input::get('location');
            #dd($place);
            $country = Input::get('default_country');
            $str = "http://maps.googleapis.com/maps/api/geocode/json?address=$place,+$country&sensor=true";
            $geo_json = json_decode(file_get_contents($str));
            if($geo_json->status == 'ZERO_RESULTS') {
                $this->message = 'ZERO_RESULTS';
            } elseif(isset($geo_json->results[0]->geometry->bounds)) {
                $east = $geo_json->results[0]->geometry->bounds->northeast->lng;
                $west = $geo_json->results[0]->geometry->bounds->southwest->lng;
                $north = $geo_json->results[0]->geometry->bounds->northeast->lat;
                $south = $geo_json->results[0]->geometry->bounds->southwest->lat;
            } elseif(isset($geo_json->results[0]->geometry->location)) {
                $longitude = (float) $geo_json->results[0]->geometry->location->lng;
                $latitude = (float) $geo_json->results[0]->geometry->location->lat;
                $radius = 1; // in miles

                $east = $longitude - $radius / abs(cos(deg2rad($latitude)) * 69);
                $west = $longitude + $radius / abs(cos(deg2rad($latitude)) * 69);
                $north = $latitude - ($radius / 69);
                $south = $latitude + ($radius / 69);
            }
        }

        if(isset($north)) {
            $properties = $properties->where('lat', '>=', min([$north, $south]));
            $properties = $properties->where('lat', '<=', max([$north, $south]));
            $properties = $properties->where('lng', '>=', min([$east, $west]));
            $properties = $properties->where('lng', '<=', max([$east, $west]));
        }
        return $properties;
    }

    protected function searchProperties($vars = []) {
		$properties = new Property();
        //sale or rent
        #if($listing_type)
            #$properties = $properties->where('listing_type', $listing_type);
        if(isset($vars['listing_type']) && in_array($vars['listing_type'], ['sale', 'rent']))
            $properties = $properties->where('listing_type', $vars['listing_type']);
				
		if(isset($vars['features'])) {
            foreach ($vars['features'] as $feature) {
                $properties = $properties->where($feature, 1);
            }
        }
        $properties = $properties->where('visible', 1);

        if(isset($vars['property_conditions'])) {
            $properties = $properties->whereIn('property_condition', $vars['property_conditions']);
        } else {
            $vars['property_conditions'] = [];
        }

        if(isset($vars['min_price']) && $vars['min_price']) {
            $properties = $properties->where('price', '>', $vars['min_price']);
        }
        if(isset($vars['max_price']) && $vars['max_price']) {
            $properties = $properties->where('price', '<=', $vars['max_price']);
        }

        if(isset($vars['min_beds']) && $vars['min_beds']) {
            $properties = $properties->where('num_bedrooms', '>=', $vars['min_beds']);
        }
        if(isset($vars['max_beds']) && $vars['max_beds']) {
			$vars['max_beds'] = (int) $vars['max_beds'];
		}
        if(isset($vars['max_beds'])) {
			$vars['max_beds'] = (int) $vars['max_beds'];
			if($vars['max_beds']) {
				$properties = $properties->where('num_bedrooms', '<=', $vars['max_beds']);
			}
        }
	
        if(Input::get('days_search')) {
            $properties = $properties->where('published_at', '>=', DB::raw("DATE_SUB(CURDATE(), INTERVAL ".(int) Input::get('days_search')." DAY)"));
        }
#dd(Input::get('criteria_main'));
        if(isset($vars['criteria_main']) && $vars['criteria_main']) {
			$property_types = PropertyType::where('search_criteria_type_id', $vars['criteria_main'])->get();
			$property_type_ids = [];
			foreach($property_types as $property_type) {
				$property_type_ids[] = $property_type->id;
			}
			if(count($property_type_ids)) {
				$properties = $properties->whereIn('property_type_id', $property_type_ids);
			}
			#dd($properties->get()->toArray());
        }
		
        if(isset($vars['property_types']) && is_array($vars['property_types'])) {
            $properties = $properties->whereIn('property_type_id', array_keys($vars['property_types']));
        }
		
        //restrict the location
        $properties = $this->restrictLocation($properties);
		return [$properties, $vars];

	}
	
    public function getIndex($listing_type = null)
    {
		$preset_data = [];
		if(isset($listing_type->regions_data)) {
			$preset_data = $listing_type->regions_data;	
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

        #dd($vars);
        
		list($properties, $vars) = $this->searchProperties($vars);
		$properties = $properties->with('agent');

        //sort the results
        $sort_type = 'most_recent';
        if(Input::get('sort_type')) {
            $sort_type = Input::get('sort_type');
        }
        if($sort_type == 'most_recent') {
            $properties->orderBy('published_at', 'DESC');
        }
        if($sort_type == 'highest_price') {
            $properties->orderBy('price', 'DESC');
        }
        if($sort_type == 'lowest_price') {
            $properties->orderBy('price', 'ASC');
        }
		
        $properties = $properties->paginate(12);
		
        $data = array();
        $filters = $this->getFilters();
        foreach($filters as $filter => $values) {
            $data[$filter] = $values;
        }

        $data['properties'] = $properties;
        $data['view_type'] = 'grid';
        $data['sort_type'] = $sort_type;

        $sort_types = array();
        $sort_types['highest_price'] = _l('Highest price');
        $sort_types['lowest_price'] = _l('Lowest price');
        $sort_types['most_recent'] = _l('Most recent');
        $data['vars'] = $vars;
        $data['sort_types'] = $sort_types;

        $data['listing_type'] = $listing_type;
        $data['message'] = $this->message;

        $data['pagination_query'] = Input::get();
        unset($data['pagination_query']['page']);

        Session::put('last_search.query', $vars);
        Session::put('last_search.type', $listing_type);
		
        if(Request::ajax()) {
            $html = view('listings.view', $data)->render();
            return Response::json(array('html' => $html));
        }

        return view('pages.listings', $data);
    }

    public function globalSearch (){
        #dd(Input::get());

        $query_string = http_build_query(Input::get());
        if(Input::get('to_rent') == 1) {
            return Redirect::to(route_lang('to_rent').'?'.$query_string);
        } else {
            return Redirect::to(route_lang('for_sale').'?'.$query_string);
        }

    }


    // getBoundingBox
    // hacked out by ben brown <ben@xoxco.com>
    // http://xoxco.com/clickable/php-getboundingbox
 
    // given a latitude and longitude in degrees (40.123123,-72.234234) and a distance in miles
    // calculates a bounding box with corners $distance_in_miles away from the point specified.
    // returns $min_lat,$max_lat,$min_lon,$max_lon 
    private function getBoundingBox($lat_degrees,$lon_degrees,$distance_in_miles) {
    
        $radius = 3963.1; // of earth in miles
    
        // bearings 
        $due_north = 0;
        $due_south = 180;
        $due_east = 90;
        $due_west = 270;
    
        // convert latitude and longitude into radians 
        $lat_r = deg2rad($lat_degrees);
        $lon_r = deg2rad($lon_degrees);
            
        // find the northmost, southmost, eastmost and westmost corners $distance_in_miles away
        // original formula from
        // http://www.movable-type.co.uk/scripts/latlong.html
    
        $northmost  = asin(sin($lat_r) * cos($distance_in_miles/$radius) + cos($lat_r) * sin ($distance_in_miles/$radius) * cos($due_north));
        $southmost  = asin(sin($lat_r) * cos($distance_in_miles/$radius) + cos($lat_r) * sin ($distance_in_miles/$radius) * cos($due_south));
        
        $eastmost = $lon_r + atan2(sin($due_east)*sin($distance_in_miles/$radius)*cos($lat_r),cos($distance_in_miles/$radius)-sin($lat_r)*sin($lat_r));
        $westmost = $lon_r + atan2(sin($due_west)*sin($distance_in_miles/$radius)*cos($lat_r),cos($distance_in_miles/$radius)-sin($lat_r)*sin($lat_r));
            
            
        $northmost = rad2deg($northmost);
        $southmost = rad2deg($southmost);
        $eastmost = rad2deg($eastmost);
        $westmost = rad2deg($westmost);
            
        // sort the lat and long so that we can use them for a between query        
        if ($northmost > $southmost) { 
            $lat1 = $southmost;
            $lat2 = $northmost;
        
        } else {
            $lat1 = $northmost;
            $lat2 = $southmost;
        }
    
    
        if ($eastmost > $westmost) { 
            $lon1 = $westmost;
            $lon2 = $eastmost;
        
        } else {
            $lon1 = $eastmost;
            $lon2 = $westmost;
        }
        
        return array($lat1,$lat2,$lon1,$lon2);
    }
 

}
?>