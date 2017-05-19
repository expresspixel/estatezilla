<?php namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\Property;
use App\Models\PropertyType;
use View;
use Session;
use Config;
use Input;
use Auth;
use Request;
use Redirect;
use Mail;
use App\Http\Requests\ContactRequest;
use Setting;

class ContactController extends SiteController {


    /**
     * Inject the models.
     * @param Post $post
     * @param User $user
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
	public function getIndex($page = null)
	{
		$default_message = "";
        if(Input::get('property_id')) {
			$property_id = (int) Input::get('property_id');
            $property = Property::find($property_id);
            $data['property'] = $property;
			$default_message .= "Property link : ".route_lang('property', array($property->id))."\n";
			$default_message .= "Property reference : ".$property->id."\n";
			$default_message .= "\n";
        }

		$report_type = Input::get('type');
		if($report_type == 'report') {
			$default_message .= "I've found something wrong with this property...";
       	}
		if($report_type == 'feedback') {
			$default_message .= "I have some feedback...";
       	}

		$data = [];
        $data['page'] = $page;
        $data['url'] = '';
        $data['report_type'] = $report_type;

        if ( !Auth::guest() ) {
			$data['first_name'] = Auth::user()->first_name;
			$data['last_name'] = Auth::user()->last_name;
			$data['email'] = Auth::user()->email;
			$data['phone_number'] = Auth::user()->phone_number;
        } else {
        	$data['first_name'] = '';
			$data['last_name'] = '';
			$data['email'] = '';
			$data['phone_number'] = '';
		}


		$data['default_message'] = $default_message;
    $data['contact_categories'] = [];
		if(isset($page->regions_data['contact']) && !is_null($page->regions_data['contact']->categories)) {
			$data['contact_categories'] = $page->regions_data['contact']->categories;
      //dd($data['contact_categories']);
      if( !is_null($page->regions_data['contact']->categories) ) {
			     $data['contact_categories'] = array_combine($data['contact_categories'], $data['contact_categories']);
      }
		}

		return view('pages.contact-us', $data);
	}

	public function postIndex(ContactRequest $request)
	{

		$post_data = Input::get();
		// the data that will be passed into the mail view blade template
		$data = array(
			'first_name'  => $post_data['first_name'],
			'last_name'  => $post_data['last_name'],
			'email_address'  => $post_data['email_address'],
			'phone_number'  => $post_data['phone_number'],
			'comment'  => $post_data['comment'],
			'url'  => $post_data['url'],
			'report_type'  => $post_data['report_type'],
		);

		// use Mail::send function to send email passing the data and using the $user variable in the closure
		$owner_info = null;
		if(isset($post_data['owner_id'])) {
			$owner_info = User::find($post_data['owner_id']);
		}

		Mail::send('emails.support_form', $data, function($message) use ($owner_info, $data)
		{
			$website_name = Setting::get('website_name');
			$support_email = Setting::get('support_email');
			$message->from($data['email_address'], $support_email);
			$message->replyTo($data['email_address'], $data['first_name']. ' '.$data['last_name']);
			if($owner_info) {
				$message->to($owner_info->email, $owner_info->username)->subject(_('Message from '.$website_name.' visitor'));
			}
			$message->to($support_email, $website_name)->subject(_('Message from '.$website_name.' visitor'));
		});

		return Redirect::back()->with('success', _('Thanks for your message. We\'ll get back to you shortly.'));

	}

}
