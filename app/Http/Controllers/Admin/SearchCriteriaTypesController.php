<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use App\Models\PropertyType;
use App\Models\SearchCriteriaType;
use Setting;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;

class SearchCriteriaTypesController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function index()
    {
        return SearchCriteriaType::get();
    }

    public function update($id)
    {

        //do nothing
        $search_criteria_type = SearchCriteriaType::find($id);
        $search_criteria_type->name = Input::get('name');
        $search_criteria_type->handle = str_slug($search_criteria_type->name);

        if(!$search_criteria_type->save()) {
            Log::info('Unable to create menu '.$search_criteria_type->name, (array) $search_criteria_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $search_criteria_type->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$search_criteria_type->name.'" <'.$search_criteria_type.'>');
            return Response::json(
                array(
                    'status' => 'success',
                    'menu' => SearchCriteriaType::get()
                ),
                200
            );
        }
    }

    public function destroy($id) {
        $search_criteria_type = SearchCriteriaType::find($id);
        if(!$search_criteria_type->delete()) {
            Log::info('Unable to create menu '.$search_criteria_type->name, (array) $search_criteria_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $search_criteria_type->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$search_criteria_type->menu.'" <'.$search_criteria_type.'>');
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
            $search_criteria_type = SearchCriteriaType::find($item->id);
            $search_criteria_type->position = $item->position;
            $search_criteria_type->save();
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
        $search_criteria_type = new SearchCriteriaType();
        $search_criteria_type->name = Input::get('name');
        $search_criteria_type->handle = str_slug($search_criteria_type->name);
        $search_criteria_type->position = SearchCriteriaType::count() + 1;

        if(!$search_criteria_type->save()) {
            Log::info('Unable to create menu '.$search_criteria_type->name, (array) $search_criteria_type->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $search_criteria_type->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "'.$search_criteria_type->name.'" <'.$search_criteria_type->handle.'>');
            return Response::json(
                array(
                    'status' => 'success',
                    'menu' => $search_criteria_type->toArray()
                ),
                200
            );
        }

        return $search_criteria_type;
    }

}
