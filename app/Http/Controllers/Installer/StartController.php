<?php namespace App\Http\Controllers\Installer;

use Session;
use Setting;
use Input;
use Response;
use File;
use Hash;
use DB;
use Schema;
use App\Http\Controllers\Controller;
use App\Http\Requests\Installer\DetailsRequest;
use App\Http\Requests\Installer\DatabaseRequest;
use App\Models\User;

class StartController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Home Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders your application's "dashboard" for users that
	| are authenticated. Of course, you are free to change or remove the
	| controller as you wish. It is just here to get your app started!
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
    /**
     * Inject the models.
     */
	private $already_installed = false;
    public function __construct()
    {
		$this->already_installed = false;
		$connection = @mysqli_connect(env('DB_HOST'),env('DB_USERNAME'),env('DB_PASSWORD'),env('DB_DATABASE'),env('DB_PORT'));
		if( $connection ) {
			$this->already_installed = true;
			$this->already_installed = false;
		}
    }

    /**
     * Returns all the blog posts.
     *
     * @return View
     */
    public function getIndex()
    {
		if($this->already_installed) {
			die("ERROR: already installed");
		}
		$data = [];
		return view('installer/1_start', $data);
    }

	public function postIndex(DetailsRequest $request)
    {
		if($this->already_installed) {
			die("ERROR: already installed");
		}
		Session::put('installation_details', Input::get());
		return redirect('installer/database');
    }
	
    public function getDatabase()
    {
		if($this->already_installed) {
			die("ERROR: already installed");
		}
		if(!Session::has('installation_details')) {
			return redirect('installer');
		}
		$data = [];
		return view('installer/2_database', $data);
    }
    
	public function postDatabase(DatabaseRequest $request)
    {
		if($this->already_installed) {
			die("ERROR: already installed");
		}
		if(!Session::has('installation_details')) {
			return redirect('installer');
		}

		//create config .env
		$template = file_get_contents(base_path('.env.template'));
		$template = str_replace('<APP_KEY>', env('APP_KEY'), $template);
		$template = str_replace('<DB_HOST>', Input::get('database_host'), $template);
		$template = str_replace('<DB_USERNAME>', Input::get('database_username'), $template);
		$template = str_replace('<DB_PASSWORD>', Input::get('database_password'), $template);
		$template = str_replace('<DB_DATABASE>', Input::get('database_name'), $template);
		$template = str_replace('<DB_PORT>', Input::get('database_port'), $template);

		$bytes_written = File::put(base_path('.env'), $template);
		if ($bytes_written === false) {
    		die("Error: Please make sure the .env file is writable.");
		}
		
		return redirect('installer/migrations');

    }

    public function getDetails()
    {
		$data = [];
		return view('installer/3_details', $data);
    }
	
    public function getMigrations()
    {
		if(Schema::hasTable('users')) {
			die("ERROR: already installed");
		}
		
    	//run migrations
		\Artisan::call('migrate');
		return redirect('installer/seed');
    }

    public function getSeed()
    {
		if(User::count()) {
			//die("ERROR: already installed");
		}
		
    	//get session
    	$session = Session::get('installation_details');

		//create admin user
    	$user = User::where('email', $session['email'])->first();
    	if(!$user) {
    		$user = new User;
		}
        $user->username = $session['username'];
        $user->email = $session['email'];
        $user->password = Hash::make($session['password']);
        $user->is_admin = 1;
        $user->admin_permissions = '["properties","members","pages","navigation","languages","transactions","settings"]';
		$user->save();

		$oauth_clients = DB::table('oauth_clients')->first();
		if(!$oauth_clients) {
			DB::table('oauth_clients')->insert(
    			array('id' => 1, 'secret' => 'changeme', 'name' => 'estatezilla')
			);
		}

		//create site settings
		$settings = [];
		$settings['default_locale'] = 'en';
		$settings['website_name'] = $session['site_title'];
		$settings['company_name'] = $session['site_title'];
		$settings['website_title'] = $session['site_title'];
		$settings['analytics_code'] = '';
		$settings['initial_lat'] = 51.507351;
		$settings['initial_lng'] = -0.127758;
		$settings['initial_zoom'] = 9;
		$settings['default_country'] = 'GB';
		$settings['theme'] = 'default';
		$settings['timezone'] = 'GMT Standard Time';
		$settings['default_currency'] = 'GBP';
		$settings['support_email'] = $session['email'];

		foreach($settings as $setting_key => $setting_value) {
			Setting::set($setting_key, $setting_value);
		}
		Setting::save();
		
		//sample data for pages, property types, single property
		$sql = file_get_contents(base_path('database/seeds/preset_data.sql'));
		DB::unprepared($sql);

		//update config .env
		$template = file_get_contents(base_path('.env'));
		$template = str_replace('APP_ENV='.env('APP_ENV'), 'APP_ENV=production', $template);
		$template = str_replace('APP_DEBUG='.env('APP_DEBUG'), 'APP_DEBUG=false', $template);
		$bytes_written = File::put(base_path('.env'), $template);
		if ($bytes_written === false) {
    		die("Error: Please make sure the .env file is writable.");
		}

		return redirect('installer/success');
    }

    public function getSuccess()
    {
		$data = [];
		$session = Session::get('installation_details');
		$data['username'] = $session['username'];
		return view('installer/3_success', $data);
    }

}
