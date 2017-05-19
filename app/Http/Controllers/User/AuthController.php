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

class AuthController extends SiteController {

    /**
     * User Model
     * @var User
     */
    protected $user;

    use AuthenticatesAndRegistersUsers;


    protected $redirectTo = '/dashboard';
    /**
     * Create a new authentication controller instance.
     *
     * @param  \Illuminate\Contracts\Auth\Guard  $auth
     * @param  \Illuminate\Contracts\Auth\Registrar  $registrar
     * @return void
     */
    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;

        $this->middleware('guest', ['except' => ['getLogout','getConfirm']]);
        parent::__construct();
    }

    /**
     * Displays the form for user creation
     *
     */
    public function getCreate()
    {
        return view('user/create');
    }


    /**
     * Displays the login form
     *
     */
    /*public function getLogin()
    {

        $user = Auth::user();
        if(!empty($user->id)){
            return Redirect::to('/');
        }
//dd(app()->environment());
        return view('user/login');
    }*/

    /**
     * Attempt to do login
     *
     */
    public function postLogin(LoginRequest $request)
    {

        if (Auth::attempt(['email' => Input::get( 'email' ), 'password' => Input::get( 'password' )]))
        {
            return redirect()->intended(route_lang('user/dashboard'));
        }
        return redirect(route_lang('auth/login'))->withErrors([
            'email' => 'The credentials you entered did not match our records. Try again?',
        ]);

        $input = array(
            'email'    => Input::get( 'email' ), // May be the username too
            'username' => Input::get( 'email' ), // May be the username too
            'password' => Input::get( 'password' ),
            'remember' => Input::get( 'remember' ),
        );

        // If you wish to only allow login from confirmed users, call logAttempt
        // with the second parameter as true.
        // logAttempt will check if the 'email' perhaps is the username.
        // Check that the user is confirmed.
        if ( Confide::logAttempt( $input, true ) )
        {
            $r = Session::get('loginRedirect');
            if (!empty($r))
            {
                Session::forget('loginRedirect');
                return Redirect::to($r);
            }
            return Redirect::to(route_lang('user/dashboard'));
        }
        else
        {
            // Check if there was too many login attempts
            if ( Confide::isThrottled( $input ) ) {
                $err_msg = Lang::get('confide::confide.alerts.too_many_attempts');
            } elseif ( $this->user->checkUserExists( $input ) && !$this->user->isConfirmed( $input ) ) {
                $err_msg = Lang::get('confide::confide.alerts.not_confirmed');
            } else {
                $err_msg = Lang::get('confide::confide.alerts.wrong_credentials');
            }

            return Redirect::to(route_lang('auth/login'))
                ->withInput(Input::except('password'))
                ->with( 'error', $err_msg );
        }
    }

    /**
     * Attempt to confirm account with code
     *
     * @param  string  $code
     */
    public function getConfirm( $code )
    {
        $user = User::where('confirmation_code', '=', $code)->get()->first();
        if( $user ) {
            $user->confirmed = 1;
            $user->save();
            return redirect()->route(route_lang('auth/login'))->with( 'notice', 'Confirmed successfully' );
        } else {
            return Redirect::to(route_lang('auth/login'))
                ->with( 'notice', 'wrong_confirmation' );
        }

    }

}
