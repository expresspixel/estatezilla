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
use App\Models\User;
use App\Models\Page;
use Setting;
use App\Models\PageTranslation;
use App\Models\Region;

class ContentController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function index()
    {
        $currentLocale = Input::get('currentLocale', 'en');
		$sortField = Input::get('sortField');
		$sortDirection = Input::get('sortDirection');
		$search = Input::get('search');
		#new Page();
		//pagination
		$pages = new PageTranslation();
		$pages = $pages->where('id', '>', 0);
		$pages = $pages->where('locale', '=', $currentLocale);
		
		//searching
		if($search) {
			$search = "%".$search."%";		
			$pages->where(function($query) use ($search)
			{
				$where = ['title','description','url'];
				$where = ['title'];
				foreach ($where as $field) {
					$query->orWhere($field, 'LIKE', $search);
				}
			});
		}
		
		$pages = $pages->with(array('translations'=>function($query){
			$query->select('id','page_id','locale','status','visibility');
		}));
		$pages = $pages->orderBy($sortField, $sortDirection);
		return $pages->paginate(10);
    }
	
    public function show($page_id, $locale = null)
    {
		
		//check if translation exists
        $default_locale = Config::get('app.locale');

        App::setLocale($locale);
		$page = Page::find($page_id);
        #dd($page_id);
		if(!$page) {
			return Response::json(
				array(
					'status' => 'error',
					'errors' => ['page' => 'Page not found']
				),
				403
			);
		}

		$page_translation = $page->translate($locale);
        #return $page;

		if(!$page_translation) {
			
			//let's create a page
			$translations = PageTranslation::where('page_id', $page_id)->get();
			foreach($translations as $translation) {
				$default_translation = $translation;
				if($translation['locale'] == $default_locale) {
					break;
				}
			}

			$page_translation = new PageTranslation();
			$page_translation->page_id = $default_translation->page_id;
			$page_translation->locale = $locale;
			$page_translation->title = "UNTRANSLATED ".$default_translation->title . " ($locale)";
			$page_translation->slug = $default_translation->slug;
			$page_translation->content = $default_translation->content;
			$page_translation->seo_title = $default_translation->seo_title;
			$page_translation->seo_meta_description = $default_translation->seo_meta_description;
			$page_translation->seo_meta_keywords = $default_translation->seo_meta_keywords;
			$page_translation->status = "DRAFT";
			$page_translation->visibility = "HIDDEN";
			$page_translation->save();	
		}

        $this->syncRegions($page_translation);
		$page_translation->setHidden([]);
        $page = Page::find($page_id);

        $theme = Setting::get('theme');
        $response = $this->get_theme_config($theme);
        $response['regions'] = Region::where('page_id', $page->id)->get();
        $page->meta = $response;
		return $page;
    }

    public function get_theme_config($theme) {
        $theme_settings_file = base_path("resources/views/".$theme."/config.php");
        $theme_settings = false;
        if(file_exists($theme_settings_file)) {
            $theme_settings = include $theme_settings_file;
        }
        return $theme_settings;
    }

    public function get_page_template($page_translation) {
        $page = Page::find($page_translation->page_id);
        $theme = Setting::get('theme');
        $response = $this->get_theme_config($theme);
        foreach($response['templates'] as $template) {
            if($page->template == $template['view']) {
                return $template;
            }
        }

        return false;

    }

    public function syncRegions($page_translation) {

        $template = $this->get_page_template($page_translation);
        if(!$template || !isset($template['regions']))
            return false;
		
        foreach($template['regions'] as $tpl) {

            $region = Region::where('page_id', $page_translation->page_id)
                ->where('handler', $tpl['id'])
				->withTrashed()
                ->first();

            if(!$region) {
                $region = new Region();
                $region->page_id = $page_translation->page_id;
            }

            $region->name = $tpl['label'];
            $region->type = $tpl['region'];
            $region->handler = $tpl['id'];
            $region->save();
        }
		
		//remove unneeded regions
		$region_ids = array_pluck($template['regions'], 'id');
        $regions = Region::where('page_id', $page_translation->page_id)
					->withTrashed()
					->get();
		foreach($regions as $region) {
			if(!in_array($region->handler, $region_ids)) {
				$region->delete();
			} else {
				if($region->trashed()) {
					$region->restore();
				}
			}
		}
    }
	
    public function update_translation($page_id, $locale, $translation_id = null) {

		$page = Page::find($page_id);
        $page->template = Input::get('template');
        $page->handler = Input::get('handler');
        $page->save();

        $content = PageTranslation::where('page_id', $page_id)
                        ->where('locale', $locale)
                        ->first();
        if(!$content) {
            $content = new PageTranslation();
            $content->locale = $locale;
            $content->page_id = $page_id;
        }
		$content = $this->create_page($page, $content);
		#return 5;

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
			Log::info('Created content "'.$content->slug.'" <'.$locale.'>');
			return Response::json(
				array(
					'status' => 'success',
					'content' => $content->toArray()
				),
				200
			);
		}
	}

    public function destroy($translation_id) {
        $translation = PageTranslation::find($translation_id);
        $page = Page::find($translation->page->id);
        if(!$page->delete()) {

            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $page->errors()
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

    public function update($id)
    {
		//do nothing
		dd($id);
    }
	
    private function create_page($page, $content) {
		$content->title = Input::get('title');
		$content->locale = Input::get('locale');
		$content->slug = Input::get('slug');
		$content->content = Input::get('content');
		$content->seo_title = Input::get('seo_title');
		$content->seo_meta_description = Input::get('seo_meta_description');
		$content->seo_meta_keywords = Input::get('seo_meta_keywords');
		$content->status = Input::get('status', 'DRAFT');
		$content->visibility = Input::get('visibility', 'HIDDEN');
		$content->page_id = $page->id;
		return $content;
	}
	
    public function getConfig() {
		$theme = Setting::get('theme');
		$data = $this->get_theme_config($theme);
		return $data;		
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
