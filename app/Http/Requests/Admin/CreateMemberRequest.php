<?php

namespace App\Http\Requests\Admin;
use App\Http\Requests\Request;

class CreateMemberRequest extends Request {

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
            'email'    => 'required|email|unique:users',
            'password'       => 'required|alpha_dash|confirmed|min:6',
		];
	}

}
