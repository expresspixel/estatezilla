<?php namespace App\Http\Controllers;


use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;

class LandingController extends SiteController {

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
    public function getIndex()
    {
        $selected_lang = false;
        $client_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);

        $languages = Config::get('app.available_locales');

        if(in_array($client_lang, $languages)) {
            $selected_lang = $client_lang;
        }
        
        if(Session::get('my.locale') && in_array(Session::get('my.locale'), $languages)) {
            $selected_lang = Session::get('my.locale');
        }

        $cookie_lang = Cookie::get('lang');
        if($cookie_lang && in_array($cookie_lang, $languages)) {
            $selected_lang = $cookie_lang;
        }

        if(!$selected_lang) {
          $selected_lang = $languages[0];
        }

        return Redirect::to('/'.$selected_lang);
    }

}
?>
