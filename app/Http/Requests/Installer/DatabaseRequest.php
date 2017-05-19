<?php namespace App\Http\Requests\Installer;

use App\Http\Requests\Request;
use Illuminate\Foundation\Http\FormRequest;
use Input;
use Session;
use Validator;

class DatabaseRequest extends FormRequest  {

	private $database_error;
	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}
	
	public function messages()
	{
		return [
			'database_port.check_connection' => 'Failed to connect to the database. '.$this->database_error
		];
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules() {
		Session::forget('installation.database.error');
		Validator::extend('check_connection', function($attribute, $value, $parameters, $values)
		{			
			$error = true;
			$connection = @mysqli_connect(Input::get('database_host'),Input::get('database_username'),Input::get('database_password'),Input::get('database_name'),Input::get('database_port'));
			if( !$connection ) {
				$this->database_error = mysqli_connect_error();
				Session::put('installation.database.error', mysqli_connect_error());
				$error = false;
			}
			if($connection && !@mysqli_select_db($connection, Input::get('database_name'))) {
				$this->database_error = mysqli_error($connection);
				Session::put('installation.database.error', mysqli_error($connection));
				$error = false;
			}
			return $error;
		});
		return [
            /*'database_name'	=> 'required',
            'database_username'	=> 'required',
            'database_password'	=> 'required',
            'database_host'	=> 'required',*/
            'database_port'	=> 'check_connection:database_name,database_username,database_password,database_host',
		];
	}




}
