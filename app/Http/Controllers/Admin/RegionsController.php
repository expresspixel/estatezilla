<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App;
use App\Models\Page;
use Setting;
use App\Models\Region;
use App\Models\RegionTranslation;

class RegionsController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function saveRegion($region_id) {

        $region = Region::find($region_id);
        if(!$region) {
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => ['region' => 'Region not found']
                ),
                403
            );
        }

        $locale = Input::get('locale');
        $region_translation = RegionTranslation::where('region_id', $region_id)
            ->where('locale', $locale)
            ->first();
        $region_translation->value = json_encode(Input::get('form'));
        $region_translation->save();

        return $region;

    }

    public function index()
    {
        $currentLocale = Input::get('currentLocale', 'en');
		$sortField = Input::get('sortField');
		$sortDirection = Input::get('sortDirection');
		$search = Input::get('search');

		//pagination
		$regions = new Region();

		//searching
		if($search) {
			$search = "".$search."%";
            $regions->where(function($query) use ($search) {
				$where = ['name'];
				foreach ($where as $field) {
					$query->orWhere($field, 'LIKE', $search);
				}
			});
		}

        $regions = $regions->with(array('translations'=>function($query){
			$query->select('region_id', 'locale');
		}));
        $regions = $regions->orderBy($sortField, $sortDirection);

		return $regions->paginate(10);
    }

    public function getForm($handler) {
        $theme = Setting::get('theme');

        $data = [];
        $data['schema'] = json_decode(file_get_contents(base_path("resources/views/".$theme."/regions/$handler/schema.json")));
        $data['options'] = json_decode(file_get_contents(base_path("resources/views/".$theme."/regions/$handler/options.json")));
		#dd($data['options']);
        return $data;

    }

    public function show($region_id, $locale = null)
    {
		$region = Region::find($region_id);
		if(!$region) {
			return Response::json(
				array(
					'status' => 'error',
					'errors' => ['region' => 'Region not found']
				),
				403
			);
		}

        $region_translation = RegionTranslation::where('region_id', $region_id)
            ->where('locale', $locale)
            ->first();
        if(!$region_translation) {
            //let's create a region translation
            $region_translation = new RegionTranslation();
            $region_translation->region_id = $region->id;
            $region_translation->locale = $locale;
            $region_translation->save();
        }

        //get schema,options, data
        $form = $this->getForm($region->handler);
        $form['data'] = $region_translation->value;
        $region->meta = $form;
		return $region;
    }
	
    public function store(StorePageRequest $request)
    {

        $locale = Input::get('locale');

        //create a page
        $page = new Page();
        $page->name = Input::get('title');
        $page->template = Input::get('template');
        $page->save();

        //add translation to it
        $content = new PageTranslation();
        $content = $this->create_page($page, $content);

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
			
		return $content;
    }
	
}
