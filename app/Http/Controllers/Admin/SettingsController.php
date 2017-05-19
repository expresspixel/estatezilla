<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LocaleCreateRequest;
use App\Http\Requests\LocaleUpdateRequest;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use App\Models\Locale;
use Setting;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;
use Request;
use Image;
use Config;

class SettingsController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function index()
    {
		$settings = \App\Models\Setting::get();
		return $settings;
    }

    public function uploadLogo() {


        $file = Request::file('file');
        $hash_path = public_path('images');

        if ($file->isValid()) {

            //move file
            Request::file('file')->move($hash_path, 'logo_tmp');
            Image::make(public_path('images/logo_tmp'))->save('images/logo.png');
            unlink(public_path('images/logo_tmp'));

            return Response::json(
                array(
                    'status' => 'success',
                    'path' => public_path('images/logo_tmp')
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

        return Input::get('file');
        return Input::get();
        dd(Input::get());
    }

    public function getOptions()
    {
        $countries = base_path('resources/data/countries.json');
        $countries = json_decode(file_get_contents($countries));

        $countries_list = [];
        $currency_list = [];
        foreach($countries as $country) {
            $tmp = [];
            $tmp['name'] = $country->name->common;
            $tmp['code'] = $country->cca2;
            if(!count($country->currency))
                continue;
            $tmp['currency'] = array_values($country->currency)[0];
            $countries_list[] = $tmp;
        }


        $currencies = base_path('resources/data/currencies.json');
        $currencies = json_decode(file_get_contents($currencies));
        foreach($currencies as $currency) {
            $tmp = [];
            $tmp['name'] = $currency->name;
            $tmp['code'] = $currency->code;
            $currency_list[] = $tmp;
        }

        $timezones = base_path('resources/data/timezones.json');
        $timezones = json_decode(file_get_contents($timezones));

        $data = [];
        $data['countries'] = $countries_list;
        $data['currencies'] = $currency_list;
        $data['timezones'] = $timezones;
		
		//gotta move this
		$themes = [];
		foreach( Config::get('themes.themes') as $theme => $properties) {
			$themes[] = ['code' => $theme, 'value' => $theme];
		}		
		$data['themes'] = $themes;
		
        return $data;
    }

    public function store()
    {
        //do nothing
        $data = Input::all();

        foreach($data as $key => $value) {
            $setting = \App\Models\Setting::where('key', $key)->first();
            if(!$setting) {
                $setting = new \App\Models\Setting();
            }

            $setting->key = $key;
            $setting->value = $value;
            $setting->save();
        }

        return Response::json(
            array(
                'status' => 'success'
            ),
            200
        );
    }
	
}
