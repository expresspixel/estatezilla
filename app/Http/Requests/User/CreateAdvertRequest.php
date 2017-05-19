<?php
namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Input;
use Auth;
use Config;

class CreateAdvertRequest extends FormRequest {

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        //validate location

        //validate descriptions

        //validate numbers
        $rules = [
            'listing_type' => 'required',
            'num_bedrooms' => 'numeric',
            'num_bathrooms' => 'numeric',
            'property_size' => 'numeric',
            'price' => 'required|numeric',
            'displayable_address' => 'required',
            'lat' => 'required',
            'lng' => 'required',
            'terms_agree' => 'required',
        ];

        $language = Config::get('app.locale');
        $rules['description.' . $language] = 'required';

        return $rules;
    }

    public function messages()
    {

        $language = Config::get('app.locale');
        $messages = [];
        $messages['description.' . $language.'.required'] = sprintf(_("You must enter the description for the  '%s' language"), $language);
        $messages['lat.required'] = _("Invalid address");
        $messages['lng.required'] = _("Invalid address");
        $messages['terms_agree.required'] = _("Please make sure the terms and conditions are accepted");
        return $messages;

    }

}