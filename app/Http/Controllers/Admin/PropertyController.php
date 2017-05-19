<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Models\Property;
use App\Models\PropertyTranslation;
use App\Models\PropertyType;
#use Illuminate\Http\Request;
use Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\User;
use App\Models\Page;
use App\Models\PageTranslation;
use Carbon\Carbon;

class PropertyController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function index()
    {
        $currentLocale = Input::get('currentLocale', 'en');
		$sortField = Input::get('sortField', 'price');
		$sortDirection = Input::get('sortDirection', 'DESC');
		$search = Input::get('search');

        App::setLocale($currentLocale);

		//pagination
		$properties = new Property();
        if( Input::get('min_beds') )
            $properties = $properties->where('num_bedrooms', '>=', Input::get('min_beds'));
        if( Input::get('max_beds') )
            $properties = $properties->where('num_bedrooms', '<=',Input::get('max_beds'));
        if( Input::get('min_price') )
            $properties = $properties->where('price', '>=', Input::get('min_price'));
        if( Input::get('max_price') )
            $properties = $properties->where('price', '<=',Input::get('max_price'));
        if( Input::get('listing_type') )
            $properties = $properties->where('listing_type', Input::get('listing_type'));
        if( Input::get('property_type_id') )
            $properties = $properties->where('property_type_id', Input::get('property_type_id'));

		//searching
		if($search) {
            $properties = $properties->where('id', $search);
            $search = "%".$search."%";
            #dd($search);
            $properties = $properties->orWhere('displayable_address', 'LIKE', $search);
            #$properties = $properties->where('id', $search);
		}
        #$properties = $properties->where('id', 5858);

        $properties = $properties->orderBy($sortField, $sortDirection);
		
		return $properties->paginate(20);
    }

    public function show($property_id)
    {

		//check if translation exists
		$property = Property::with('translations')->find($property_id);
		$user = User::find($property->user_id);
		$property->meta = ['property_types' => PropertyType::get(), 'user' => $user];
        return $property;
		if(!$property) {
			return Response::json(
				array(
					'status' => 'error',
					'errors' => ['page' => 'Page not found']
				),
				403
			);
		}

        $default_locale = Config::get('app.locale');
        $page_translation = $property->translate($default_locale);
		
		$page_translation->setHidden([]);
		return $page_translation;
    }

    private function create_translation($content)
    {
        $fields = ['title', 'description', 'summary', 'features'];
        foreach ($fields as $field) {
            if( Input::get($field) )
                $content->$field = Input::get($field);
        }

        return $content;
    }

    public function update_translation($property_id, $locale) {

		$property = Property::find($property_id);
		$content = $property->translate($locale);
        if(!$content) {
            $content = new PropertyTranslation();
            $content->property_id = $property_id;
            $content->locale = $locale;
        }
		$content = $this->create_translation($content);

		#dd($content->save());		
		if(!$content->save()) {
			Log::info('Unable to create content '.$content->title, (array) $content->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $content->errors()
				),
				403
			);
		} else {
			Log::info('Created content "'.$content->title.'" <'.$locale.'>');
			return Response::json(
				array(
					'status' => 'success',
					'content' => $content->toArray()
				),
				200
			);
		}
	}

    private function create_property($content)
    {
        $fields = [
            'property_type_id', 'property_condition', 'property_size', 'num_bedrooms', 'num_bathrooms', 'price',
            'has_garden', 'has_parking', 'is_investment_property', 'listing_status', 'expires_at',
            'street_no', 'street_name', 'city', 'region', 'postcode', 'country', 'displayable_address',
            'lat', 'lng', 'listing_type',
            'is_featured', 'price', 'reduced_price', 'negotiable_price', 'poa', 'price_period', 'price_type',
        ];
        foreach ($fields as $field) {
            if( Input::has($field) )
                $content->$field = Input::get($field);
        }

        return $content;
    }
	
    public function update($id)
    {

        Log::info($_SERVER['REQUEST_METHOD'] .' '. microtime(true) .' '.Input::get('translationsJson'));
        $property = Property::find($id);
        $property = $this->create_property($property);

        if(Input::has('visible')) {
            if( Input::get('visible') && !$property->visible ) {
                $property->published_at = Carbon::now();
            }
            $property->visible = (int) Input::get('visible');
        }


        if(!$property->save()) {
            Log::info('Unable to create content '.$property->title, (array) $property->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $property->errors()
                ),
                403
            );
        } else {
            Log::info('Created content "'.$property->title.'" <'.$id.'>');
            return Response::json(
                array(
                    'status' => 'success',
                    'content' => $property->toArray()
                ),
                200
            );
        }

    }

    //upload the image
    public function updateVirtualTours($property_id) {
        $virtual_tours = json_decode( Input::get('virtual_tours') );
        $locale = json_decode( Input::get('locale') );

        $property = Property::find($property_id);
        $translation = $property->translate($locale);

        $translation->virtual_tours = json_encode($virtual_tours);
        $translation->save();
        
        return $translation;
    }

    //upload the image
    public function updateImage($property_id) {

        $file = Input::get('file');
        $imageType = Input::get('imageType');
        $locale = Input::get('locale');
        $caption = Input::get('caption');



        $property = Property::find($property_id);
        $translation = $property->translate($locale);

        $meta = (array) $translation->$imageType;
        $meta[$file] = $caption;

        $translation->$imageType = json_encode($meta);
        $translation->save();

        return $translation;

    }

    //upload the image
    public function syncImages($hash_path, $property_id, $imageType) {
        $files = directory_map($hash_path);

        $images = [];
        foreach($files as $file) {
            $images[] = [
                'file' => $file,
                'caption' => unslug($file),
            ];
        }

        //sync with database
        $property = Property::find($property_id);
        $property->$imageType = json_encode($images);
        $property->save();
        return $property->$imageType;
    }

    //upload the image
    public function deleteImage($property_id) {

        $file = Input::get('file');
        $imageType = Input::get('imageType');


        $hash_folder = md5($property_id)[0]."/".md5($property_id)[1];
        $hash_path = storage_path('properties/'.$hash_folder.'/'.md5($property_id).'/'.$imageType);
        if(file_exists($hash_path.'/'.$file))
            unlink($hash_path.'/'.$file);

        $images = $this->syncImages($hash_path, $property_id, $imageType);

        return Response::json(
            array(
                'status' => 'success',
                'imageType' => $imageType,
                'files' => $images
            ),
            200
        );

    }

    //upload the image
    public function uploadImage($property_id) {

        $file = Request::file('file');
        $imageType = Request::get('imageType');
        $hash_folder = md5($property_id)[0]."/".md5($property_id)[1];
        $hash_path = storage_path('properties/'.$hash_folder.'/'.md5($property_id).'/'.$imageType);

        if ($file->isValid()) {

            //create directory
            if(!is_dir($hash_path)) {
                mkdir($hash_path, 0777, true);
            }

            //move file
            Request::file('file')->move($hash_path, $file->getClientOriginalName());

            $images = $this->syncImages($hash_path, $property_id, $imageType);

            return Response::json(
                array(
                    'status' => 'success',
                    'imageType' => $imageType,
                    'files' => $images
                ),
                200
            );
        } else {
            return Response::json(
                array(
                    'status' => 'error'
                ),
                403
            );
        }

    }

    public function store()
    {

        $locale = Config::get('app.locale');


        $data = array(
            'property_type_id' => Input::get('property_type_id'),
            'listing_status' => Input::get('listing_status'),
            $locale  => array('title' => Input::get('title')),
        );

        $property = Property::create($data);
        return Response::json(
            array(
                'status' => 'success',
                'property' => $property->toArray()
            ),
            200
        );
        return $property;
        dd($property);

        //create a page
        $property = new Property();
        $property->property_type_id = Input::get('property_type_id');
        $property->listing_status = Input::get('listing_status');
        #dd($default_locale);
        $property->save();


        //add translation to it
        $property_type = $property->translate($locale);
        dd($property_type);
        $property_type = $this->create_property($property_type);

		if(!$property_type->save()) {
			Log::info('Unable to create content '.$property_type->title, (array) $property_type->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $property_type->errors()
				),
				403
			);
		} else {
			Log::info('Created content "'.$property_type->title.'" <'.$locale.'>');
			return Response::json(
				array(
					'status' => 'success',
					'content' => $property->toArray()
				),
				200
			);
		}
			
		return $property_type;
    }
	
	public function destroy($property_id) {
        $property = Property::find($property_id);
        if(!$property->delete()) {

            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $property->errors()
                ),
                403
            );
        } else {
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }
	
}
