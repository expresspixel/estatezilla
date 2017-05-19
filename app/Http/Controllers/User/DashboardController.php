<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SiteController;
use App\Http\Requests\User\RegisterRequest;
use App\Http\Requests\User\LoginRequest;
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

class DashboardController extends SiteController {

    /**
     * Inject the models.
     */
    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;
        $this->middleware('auth');
        #$this->middleware('guest', ['except' => ['getLogout','getConfirm']]);
        parent::__construct();
    }

    /**
     * Users settings page
     *
     * @return View
     */
    public function getIndex()
    {
        return redirect(route_lang('user/favourites'));
        $user = Auth::user();
        $data = array();
        $data['user'] = $user;
        
        return view('user/dashboard', $data);
    }

}
