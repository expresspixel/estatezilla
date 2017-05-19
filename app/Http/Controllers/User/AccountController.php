<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SiteController;
use App\Http\Requests\User\AccountRequest;
use App\Http\Requests\User\RegisterRequest;
use App\Http\Requests\User\LoginRequest;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use App\Models\User;
use DB;
use Config;
use Lang;
use Input;
use Request;
use Response;
use Redirect;
use Session;
use Auth;


class AccountController extends SiteController {

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
     * Returns all the blog posts.
     *
     * @return View
     */
    public function getIndex()
    {
        $data = array();
        return view('user/change-password', $data);
    }

    public function postIndex(AccountRequest $request)
    {
        $user = Auth::user();
        $user->password = Input::get('password');
        $user->save();
        return redirect(route_lang('user/change-password'))->with('success', _l('Password changed successfully!'));
    }


}
?>