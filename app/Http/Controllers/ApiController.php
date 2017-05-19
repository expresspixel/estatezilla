<?php namespace App\Http\Controllers;

use App\Models\PropertyType;
use Intervention\Image\Facades\Image;
use Response;

class ApiController extends Controller {


    /**
     * Inject the models.
     */
    public function __construct()
    {

    }
    
	public function getPropertyTypes() {
		$property_types = PropertyType::lists('name', 'id');
        return $property_types;
	}
	
}