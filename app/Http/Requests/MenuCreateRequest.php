<?php namespace App\Http\Requests;

use App\Http\Requests\Request;

class MenuCreateRequest extends Request {

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
            'name'             => 'required|min:1',
            'handle'           => 'required|alpha_dash|unique:menus|min:1',
		];
	}

}
