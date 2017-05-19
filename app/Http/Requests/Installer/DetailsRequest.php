<?php namespace App\Http\Requests\Installer;

use App\Http\Requests\Request;
use Illuminate\Foundation\Http\FormRequest;

class DetailsRequest extends FormRequest  {

	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [
            'site_title'	=> 'required|min:10',
            'username'	=> 'required|alpha_num',
            'password'	=> 'required|confirmed',
            'email'	=> 'required|email',
		];
	}




}
