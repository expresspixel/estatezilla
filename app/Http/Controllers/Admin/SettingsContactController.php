<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use Setting;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;

class SettingsContactController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function store()
    {
        //do nothing
        $data = Input::all();
        foreach($data as $key => $value) {
            $setting = Setting::where('key', $key)->first();
            if(!$setting) {
                $setting = new Setting();
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
