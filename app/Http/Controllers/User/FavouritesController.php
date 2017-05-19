<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SiteController;
use App\Http\Requests\User\RegisterRequest;
use App\Http\Requests\User\LoginRequest;
use App\Models\Favourite;
use App\Models\Property;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use App\Models\User;
use DB;
use Config;
use Illuminate\Support\Facades\Lang;
use Input;
use Request;
use Response;
use Redirect;
use Session;
use Auth;

class FavouritesController extends SiteController {

    /**
     * Inject the models.
     */
    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;
        $this->middleware('auth');
        parent::__construct();
    }

    /**
     * Returns all saved properties.
     *
     * @return View
     */
    public function getIndex()
    {

        $data = array();
        $properties = Property::join('favourites', 'properties.id', '=', 'favourites.property_id')
            #->where('is_published', '=', 1)
            #->where('expires_at', '>', new \DateTime)
            ->whereNull('deleted_at')
            ->groupBy('properties.id')
            ->select(
                array(
                    'properties.*'
                    )
            );

        $properties = $properties->paginate(12);
        $data['properties'] = $properties;

        return view('user/favourites', $data);
    }

    public function getRemove($property_id) {
        $favourite = Favourite::where('user_id', Auth::user()->id)->where('property_id', $property_id)->first();
        if($favourite)
            $favourite->delete();
        
        return Redirect::to(route_lang('user/favourites_list'));
    }

}
?>