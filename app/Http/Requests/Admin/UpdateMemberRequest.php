<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Request;
use Illuminate\Support\Facades\Log;

class UpdateMemberRequest extends Request {

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
        Log::info($this->getSegmentFromEnd());
		return [
            'email'    => 'required|email|unique:users,email,'.$this->getSegmentFromEnd(),
            'password'       => 'alpha_dash|confirmed|min:6',
        ];
	}

}
