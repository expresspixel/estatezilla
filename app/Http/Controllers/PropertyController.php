<?php namespace App\Http\Controllers;

use App\Http\Requests\PropertyEmailRequest;
use App\Models\Favourite;
use App\Models\Property;
use App\Models\PropertyTranslation;
use App\Models\PropertyType;
use Setting;
use App\Models\User;
use Session;
use Request;
use Response;
use Auth;
use DB;
use Config;
use Input;
use Mail;

class PropertyController extends SiteController {

    /**
     * Inject the models.
     */
    public function __construct()
    {
        parent::__construct();
    }


    /**
     * Returns all the blog posts.
     *
     * @return View
     */
    public function getIndex($id)
    {

        $data = array();

        //get property
        $property = Property::find($id);

        if(!$property || !$property->visible)
            return Response::view('error.403', array('message' => 'Sorry, this property does not exist.'), 403);

        //get agent name
        $agent = User::where('id', $property->user_id)->first();

        $locale = Config::get( 'app.locale' );
        $translation = PropertyTranslation::where('property_id', '=', $id)
            ->where('locale', '=', $locale)
            ->first();

				$data = array();
        $data['property'] = $property;
        $data['property_info'] = $translation;
        $data['agent'] = $agent;
        $data['page_title'] = $property->title;
        $data['page_description'] = $translation->seo_meta_description;

        //here we check if it's a saved property
				$data['favourite'] = false;
        if ( !Auth::guest() ) {
            $favourite = Favourite::where('user_id', Auth::user()->id)->where('property_id', $property->id)->first();
            if($favourite) {
                $data['favourite'] = true;
            }
        }

        return view('pages.property', $data);
    }

    public function sendEmail(PropertyEmailRequest $request) {
        try {
            $property_id = (int) Input::get('property_id');
            $property = Property::find($property_id);
            $agent_info = User::find($property->user_id);
            $post_data = Input::get();

            // the data that will be passed into the mail view blade template
            $data = array(
                'phone_number'  => $post_data['phone_number'],
                'property'  => $property->displayable_address,
                'your_email'  => $post_data['your_email'],
                'comments'  => $post_data['message'],
                'full_name'  => $post_data['full_name']
            );

            //Mail::pretend();
            Mail::send('emails.contact_agent', $data, function($message) use ($agent_info, $data)
            {
                $website_name = Setting::get('website_name');
                $email = Setting::get('support_email');

                $message->from($email, $website_name);
                $message->replyTo($data['your_email'], $data['full_name']);
                $message->to($agent_info->email, $agent_info->username)->subject(sprintf(_l('Message from %s visitor'), $website_name));
            });
        } catch (Exception $e) {
            //echo 'Caught exception: ',  $e->getMessage(), "\n";
        }
        $result = array('status' => true);

        return json_encode($result);
    }

    public function getFavourite($property_id) {


        if (!Auth::check()) {
            Session::put('loginRedirect', Request::URL());
            $response = array();
            $response['status'] = true;
            $response['location'] = route_lang('auth/login');
            return Response::json($response);
        }
        $user = Auth::user();
        $favourite_exists = Favourite::where('user_id', $user->id)->where('property_id', $property_id)->first();

        if(!$favourite_exists) {
            $favourite = new Favourite();
            $favourite->user_id = $user->id;
            $favourite->property_id = (int) $property_id;
            $favourite->save();
        } else {
            $favourite_exists->delete();
        }

        $favourite_exists = Favourite::where('user_id', $user->id)->where('property_id', $property_id)->first();
        #dd(($favourite_exists));
        if(Request::ajax()) {
            $response = array();
            $response['html'] = (!$favourite_exists)?_l('Save property'):_l('Remove saved property');
            $response['html'] = "<span>".$response['html']."</span>";
            return Response::json($response);
        } else {
            return redirect(route_lang('property', array($property_id)));
        }

        return json_encode($result);
    }

}
