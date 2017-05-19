<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SiteController;
use App\Http\Requests\User\ProfileRequest;
use App\Http\Requests\User\RegisterRequest;
use App\Http\Requests\User\LoginRequest;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use App\Models\User;
use DB;
use Config;
use Illuminate\Support\Facades\App;
use Lang;
use Input;
use Image;
use Request;
use Response;
use Redirect;
use Session;
use Auth;

class ProfileController extends SiteController {

    protected $user;

    /**
     * Inject the models.
     */
    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;
        #$this->middleware('guest', ['except' => ['getLogout','getConfirm']]);
        parent::__construct();

        $this->user = Auth::user();
    }
    
    /**
     * Returns all the blog posts.
     *
     * @return View
     */
    public function getIndex()
    {

        $data['user'] = Auth::user();
        $data['disabled_fields'] = array('company_name', 'website', 'about', 'avatar');
        return view('user/profile', $data);
    }

    public function postIndex(ProfileRequest $request)
    {

        $oldUser = User::where('id', '=', $this->user->id)->first();
        $user = clone $oldUser;

        if(Input::get('display_name'))
            $user->display_name = Input::get('display_name');
        if(Input::get('company_name'))
            $user->company_name = Input::get('company_name');
        if(Input::get('website'))
            $user->website = Input::get('website');
        if(Input::get('about'))
            $user->about = Input::get('about');
        if(Input::get('address'))
            $user->address = Input::get('address');
        if(Input::get('mobile'))
            $user->mobile = Input::get('mobile');
        if(Input::get('phone'))
            $user->phone = Input::get('phone');
        if(Input::get('agent_type'))
            $user->agent_type = Input::get('agent_type');
        if(Input::get('fax'))
            $user->fax = Input::get('fax');

        unset($user->password);
        unset($user->password_confirmation);

        $file = Input::file('avatar');
        if($file) {
            $user_hash = md5($user->id);
            $user_hash_folder = $user_hash[0]."/".$user_hash[1]."/";

            list($mime_format, $mime_extention) = explode("/", $file->getMimeType());
            $filename = $user_hash.".".$mime_extention;

            $avatar_path = public_path('avatars/'.$user_hash_folder);
            #dd($avatar_path);
            if(!is_dir($avatar_path)) {
                mkdir($avatar_path, 0777, true);
            } else {
                @unlink($avatar_path."/".$user_hash.".png");
                @unlink($avatar_path."/".$user_hash.".jpg");
                @unlink($avatar_path."/".$user_hash.".jpeg");
                @unlink($avatar_path."/".$user_hash.".gif");
            }

            Image::make($file->getRealPath())->fit(200, 200)->save($avatar_path.$filename);

            if(file_exists($avatar_path.$filename)) {
                $user->avatar = $user_hash_folder.$filename;
            }
        }


        if($user->save()) {
            return redirect(route_lang('user/profile'))->with('success', 'YES!');
        }

        return redirect(route_lang('user/profile'))->with('error', 'Oops!');
    }

    public function setAgentType($agent_type) {

        if($agent_type == 'professional') {
           $this->user->agent_type = $agent_type;
            $this->user->save();
        } elseif($agent_type == 'nonprofessional') {
            $this->user->agent_type = 'non-professional';
            $this->user->save();
        }
        
        return Redirect::to(route_lang('user/dashboard'));
    }

    

}
?>