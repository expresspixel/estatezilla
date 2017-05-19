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
use App\Models\PageTranslation;
use App\Models\Transaction;

class TransactionsController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function index()
    {

		$sortField = Input::get('sortField');
		$sortDirection = Input::get('sortDirection');
		$search = Input::get('search');

		//pagination
		$transactions = new Transaction();
		$transactions = $transactions->with('user')
                            ->with('package')
                            ->with('payment_method');

		//searching
		if($search) {
			$search = "".$search."%";
            $transactions->where(function($query) use ($search)
			{
				$where = ['title','description','url'];
				$where = ['payment_code'];
				foreach ($where as $field) {
					$query->orWhere($field, 'LIKE', $search);
				}
			});
		}

        $transactions = $transactions->orderBy($sortField, $sortDirection);
		
		return $transactions->paginate(10);
    }
	
    public function show($page_id, $locale = null)
    {
		
		//check if translation exists

        App::setLocale($locale);
		$page = Page::find($page_id);
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
		$default_locale = Config::get('app.locale');
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
			$page_translation->yaml = $default_translation->yaml;
			$page_translation->status = "DRAFT";
			$page_translation->visibility = "HIDDEN";
			$page_translation->save();	
		}
		
		$page_translation->setHidden([]);
        $page = Page::find($page_id);
        $response = [];
        $response['templates'] = [];
        $response['templates'][] = ['name' => 'Page', 'page_type' => 'page'];
        $response['templates'][] = ['name' => 'Contact', 'page_type' => 'contact'];
        $response['templates'][] = ['name' => 'Tell a friend', 'page_type' => 'tell-friend'];
        $response['templates'][] = ['name' => 'Home', 'page_type' => 'home'];

        //$response['translation'] = $page_translation;
        #return $page;
        #$response['page'] = $page;
        $page->meta = $response;
		return $page;
    }
	
    public function update_translation($page_id, $locale, $translation_id = null) {

		$page = Page::find($page_id);
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
		$content->yaml = Input::get('yaml');
		$content->status = Input::get('status', 'DRAFT');
		$content->visibility = Input::get('visibility', 'HIDDEN');
		$content->page_id = $page->id;
		return $content;
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
