<?php namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\Property;
use View;
use Session;
use Config;
use App;
use Auth;
use Request;

class TellFriendController extends SiteController {


    public function __construct()
    {
        parent::__construct();
    }
    
	/**
	 * Returns all the blog posts.
	 *
	 * @return View
	 */
	public function getIndex()
	{

		$default_message = "";
        $property_id =  Request::segment(2);
        $property = Property::find($property_id);
        $default_message .= _l("Property link : ").route_lang('property', array($property->id))."\n";
        $default_message .= _l("Property reference : ").$property->reference."\n";
        $default_message .= "\n";

		$data = array();
        if ( !Auth::guest() ) {
			$data['your_name'] = Auth::user()->first_name;
			$data['your_email'] = Auth::user()->email;
        } else {
        	$data['your_name'] = '';
			$data['your_email'] = '';
		}


        $data['default_message'] = $default_message;
		$data['property'] = $property;

		return view('pages.tell-friend', $data);
	}	

	public function postIndex()
	{
		
		//dd(Input::get());
        $rules = array(
            'your_name' => 'required',
            'your_email' => 'required|email',
            'friend_name' => 'required',
            'friend_email' => 'required|email',
        );

        $messages = array(
            'your_name.required' => _l('Please enter your name'),
            'your_email.required' => _l('Please enter your email'),
            'friend_name.required' => _l('Please enter your friend\'s name'),
            'friend_email.required' => _l('Please enter your friend\'s email'),
        );

        $validator = Validator::make(Input::all(), $rules, $messages);
        if ($validator->passes())
        {
            try {

                $post_data = Input::get();

                // the data that will be passed into the mail view blade template
                $data = array(
                    'your_name'  => $post_data['your_name'],
                    'your_email'  => $post_data['your_email'],
                    'friend_name'  => $post_data['friend_name'],
                    'friend_email'  => $post_data['friend_email'],
                    'comment'  => $post_data['comment']
                );
                
                //Mail::pretend();

                // use Mail::send function to send email passing the data and using the $user variable in the closure
                Mail::send('emails.tell_friend', $data, function($message) use ($data)
                {
                  $message->from($data['your_email'], $data['your_name']);
                  $message->to($data['friend_email'], $data['friend_name'])->subject(sprintf( _( '%s shared a property with you' ), $data['your_name'] ));
                });
            } catch (Exception $e) {
                dd($e);
                /*echo 'Caught exception: ',  $e->getMessage(), "\n";
                die();*/
            }
            return Redirect::to(Request::URL())->with('success', _('You\'ve successfully sent this message to your friend'));
        }


        return Redirect::to(Request::URL())->withInput()->withErrors($validator);	

	}

}