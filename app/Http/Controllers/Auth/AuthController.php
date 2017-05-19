<?php namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Input;
use Authorizer;
use Response;
use App\Models\User;

class AuthController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Registration & Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users, as well as the
	| authentication of existing users. By default, this controller uses
	| a simple trait to add these behaviors. Why don't you explore it?
	|
	*/

	use AuthenticatesAndRegistersUsers;

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

		#$this->middleware('guest', ['except' => 'getLogout']);
	}

    /**
     * Attempt to do login
     *
     * @return  Illuminate\Http\Response
     */
    public function signIn()
    {
        #$repo = App::make('UserRepository');
        $input = Input::all();
		#dd($this->auth);
		#return $input;
		if ($this->auth->attempt( ['username' => $input['username'], 'password' => $input['password']] )) {
			$results = Authorizer::issueAccessToken();
			$results['data'] = $this->auth->user();
			$results['data']['permissions'] = $results['data']['admin_permissions'];
			return Response::json($results);
		} else {
            return Response::json(array('errors' => ['Invalid login credentials. Please try again.']), 401);
        }

        if ($repo->login($input)) {
			#$results = [];
			#$results['data'] = Confide::user();
			#$results['status'] = 'success';		
			$results = Authorizer::issueAccessToken();
			$results['data'] = Confide::user();
			$results['data']['permissions'] = json_decode($results['data']['admin_permissions'], true);
			return Response::json($results);
        } else {
		
            if ($repo->isThrottled($input)) {
                $err_msg = Lang::get('confide::confide.alerts.too_many_attempts');
            } elseif ($repo->existsButNotConfirmed($input)) {
                $err_msg = Lang::get('confide::confide.alerts.not_confirmed');
            } else {
                $err_msg = Lang::get('confide::confide.alerts.wrong_credentials');
            }

			return Response::json(array('errors' => [$err_msg]), 500);
			
        }
		
    }
	
	public function validateToken() {
		#var_dump(getallheaders());
		$user_id = Authorizer::getChecker()->getAccessToken()->getSession()->getOwnerId();
		$user = User::find($user_id);
		$results = [];
		$results['data'] = $user;
		$results['data']['permissions'] = $results['data']['admin_permissions'];
		#$results['data']['permissions'] = json_decode($results['data']['admin_permissions'], true);
		$results['status'] = 'success';
		return Response::json($results);
	}

	public function signOut() {
        return ['success' => true];
	}

	public function issueAccessToken() {
        return Response::json(Authorizer::issueAccessToken());
	}
	public function test() {
        xdebug_print_function_stack( 'Your own message' );

    }

}
