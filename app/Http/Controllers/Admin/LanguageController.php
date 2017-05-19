<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LocaleCreateRequest;
use App\Http\Requests\LocaleUpdateRequest;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use App\Models\Locale;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;

class LanguageController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function options()
    {
        return file_get_contents(base_path('resources/data/languages.json'));
    }

    public function index()
    {
		return Locale::get();
    }

    public function saveOrder() {
        $locales = Input::get('locales');
        $locales = json_decode($locales);
        foreach($locales as $locale_new) {
            $locale = Locale::find($locale_new->id);
            $locale->position = $locale_new->position;
            $locale->save();
        }
        return Response::json(
            array(
                'status' => 'success'
            ),
            200
        );
    }

    public function update($id, LocaleUpdateRequest $request)
    {

		//do nothing
        $locale = Locale::find($id);
        $locale->name = Input::get('name');
        $locale->code = Input::get('code');
        $locale->visible = Input::get('visible');

		if(!$locale->save()) {
			Log::info('Unable to create menu '.$locale->name, (array) $locale->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $locale->errors()
				),
				403
			);
		} else {
			Log::info('Created menu "'.$locale->menu.'" <'.$locale.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => Locale::get()
				),
				200
			);
		}
    }
	
    public function destroy($id) {
        $locale = Locale::find($id);
		if(!$locale->delete()) {
			Log::info('Unable to create menu '.$locale->name, (array) $locale->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $locale->errors()
				),
				403
			);
		} else {
			Log::info('Created menu "'.$locale->menu.'" <'.$locale.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => Locale::get()
				),
				200
			);
		}
	}
	
    public function store(LocaleCreateRequest $request)
    {

		$locale = new Locale();
        $locale->name = Input::get('name');
        $locale->code = Input::get('code');
        $locale->position = Input::get('position', 99);

		if(!$locale->save()) {
			Log::info('Unable to create locale '.$locale->name, (array) $locale->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $locale->errors()
				),
				403
			);
		} else {
			Log::info('Created locale "'.$locale->name.'" <'.$locale->code.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => $locale->toArray()
				),
				200
			);
		}
			
		return $locale;
    }
	
}
