<?php

namespace App\Widgets;

use App\Models\Property;
use Arrilot\Widgets\AbstractWidget;

class Listings extends AbstractWidget
{
    public $config = [
        'count' => 5,
        'sort_field'   => 'created_at',
        'sort_direction'   => 'ASC'
    ];

    /**
     * Treat this method just like a controller action.
     * Return a view or anything else you want to display.
     */
	public function run()
	{
        $vars = $this->config;

        $properties = new Property();
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

        if(isset($vars['days_search'])) {
            $properties = $properties->where('published_at', '>=', DB::raw("DATE_SUB(CURDATE(), INTERVAL ".(int) $vars['days_search']." DAY)"));
        }
        
        if(isset($vars['is_featured'])) {
            $properties = $properties->where('is_featured', 1);
        }

        if(isset($vars['criteria_main']) && $vars['criteria_main']) {
            $property_types = PropertyType::where('search_criteria_type_id', $vars['criteria_main'])->get();
            $property_type_ids = [];
            foreach($property_types as $property_type) {
                $property_type_ids[] = $property_type->id;
            }
            if(count($property_type_ids)) {
                $properties = $properties->whereIn('property_type_id', $property_type_ids);
            }
        }
        
        if(isset($vars['property_types']) && is_array($vars['property_types'])) {
            $properties = $properties->whereIn('property_type_id', array_keys($vars['property_types']));
        }
#dd($vars);
        $properties = $properties
                        ->orderBy($vars['sort_field'], $vars['sort_direction'])
                        ->limit($vars['count'])
                        ->get();

        return view('widgets.recent-listings', ['properties' => $properties]);
        #return view('widgets.recent-listings', ['properties' => $properties, 'cities' => $cities]);
	}

    public function placeholder()
    {
        return "Loading...";
    }
}
