<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\Menu;

class MenuController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }
	
    public function index()
    {
		return Menu::get();
    }

    public function update($id, MenuUpdateRequest $request)
    {

		//do nothing
		$menu = Menu::find($id);
		$menu->name = Input::get('name');
		$menu->handle = Input::get('handle');
		$menu->data = Input::get('json');
		#dd($menu->data);
		if(!$menu->save()) {
			Log::info('Unable to create menu '.$menu->name, (array) $menu->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $menu->errors()
				),
				403
			);
		} else {
			Log::info('Created menu "'.$menu->menu.'" <'.$menu.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => Menu::get()
				),
				200
			);
		}
    }
	
    public function destroy($id) {
		$menu = Menu::find($id);
		if(!$menu->delete()) {
			Log::info('Unable to create menu '.$menu->name, (array) $menu->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $menu->errors()
				),
				403
			);
		} else {
			Log::info('Created menu "'.$menu->menu.'" <'.$menu.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => Menu::get()
				),
				200
			);
		}
	}
	
    public function store(MenuCreateRequest $request)
    {

		$menu = new Menu();
		$menu->name = Input::get('name');
		$menu->handle = Input::get('handle');
		
		if(!$menu->save()) {
			Log::info('Unable to create menu '.$menu->name, (array) $menu->errors());
			return Response::json(
				array(
					'status' => 'error',
					'errors' => $menu->errors()
				),
				403
			);
		} else {
			Log::info('Created menu "'.$menu->name.'" <'.$menu->handle.'>');
			return Response::json(
				array(
					'status' => 'success',
					'menu' => $menu->toArray()
				),
				200
			);
		}
			
		return $menu;
    }
	
}
