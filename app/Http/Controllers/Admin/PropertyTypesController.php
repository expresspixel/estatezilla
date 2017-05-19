<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use App\Models\PropertyType;
use Setting;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;

class PropertyTypesController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function index()
    {
        return PropertyType::with('search_criteria_type')->get();
    }

    public function update($id)
    {

        //do nothing
        $property_type = PropertyType::find($id);
        $property_type->name = Input::get('name');
        $property_type->handle = str_slug($property_type->name);
        $property_type->search_criteria_type_id = Input::get('search_criteria_type_id');

        if(!$property_type->save()) {
            Log::info('Unable to create menu '.$property_type->name, (array) $property_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $property_type->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$property_type->menu.'" <'.$property_type.'>');
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }

    public function destroy($id) {
        $property_type = PropertyType::find($id);
        if(!$property_type->delete()) {
            Log::info('Unable to create menu '.$property_type->name, (array) $property_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $menu->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$property_type->name.'" <'.$property_type.'>');
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }

    public function save_order() {
        $list = Input::get('list');
        $list = json_decode($list);
        foreach($list as $item) {
            $property_type = PropertyType::find($item->id);
            $property_type->position = $item->position;
            $property_type->save();
        }
        return Response::json(
            array(
                'status' => 'success'
            ),
            200
        );
    }

    public function store()
    {
        $property_type = new PropertyType();
        $property_type->name = Input::get('name');
        $property_type->handle = str_slug($property_type->name);
        $property_type->search_criteria_type_id = Input::get('search_criteria_type_id');
        $property_type->position = PropertyType::count() + 1;

        if(!$property_type->save()) {
            Log::info('Unable to create menu '.$property_type->name, (array) $property_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $property_type->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$property_type->name.'" <'.$property_type->handle.'>');
            return Response::json(
                array(
                    'status' => 'success',
                    'menu' => $property_type->toArray()
                ),
                200
            );
        }

        return $property_type;
    }

}
