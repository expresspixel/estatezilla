<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMemberRequest;
use App\Http\Requests\Admin\CreateMemberRequest;

use Input;
use Authorizer;
use Hash;
use Response;
use App\Models\User;

class MembersController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;

        #$this->beforeFilter('auth', ['only' => ['getAuthorize', 'postAuthorize']]);
        #$this->beforeFilter('csrf', ['only' => 'postAuthorize']);
        #$this->beforeFilter('check-authorization-params', ['only' => ['getAuthorize', 'postAuthorize']]);
    }

    public function index()
    {
		$memberType = Input::get('memberType');
		$sortField = Input::get('sortField');
		$sortDirection = Input::get('sortDirection');
		$search = Input::get('search');

		$users = new User();
		if($memberType == 'advertiser') {
			$users = $users->where('is_advertiser', 1);
		}

		if($memberType == 'seller') {
			$users = $users->where('is_seller', 1);
		}

		if($memberType == 'member') {
			/*$users = $users->whereNull('is_advertiser')
						->whereNotNull('confirmation_code')
						->where('confirmation_code', '!=', '');*/
			$users = $users->where('is_admin', 0);
		}

		if($memberType == 'prospect') {
			$users = $users->whereNull('confirmation_code')
                            ->orWhere('confirmation_code', '')
							->where('is_prospect', 1);
		}

		if($memberType == 'admin') {
            $users = $users->where('is_admin', 1);
        }

		$users = $users->where('id', '>', 0);

		if($search) {
			$search = "%".$search."%";

			$users->where(function($query) use ($search)
			{
				$where = ['username','email','firstname','lastname','phone'];
				foreach ($where as $field) {
					$query->orWhere($field, 'LIKE', $search);
				}
			});
			/*$where = ['username','email','firstname','lastname','phone'];
			foreach ($where as $field) {
				$users = $users->orWhere($field, 'LIKE', $search);
			}*/
		}
		$users = $users->orderBy($sortField, $sortDirection);
		/*$users = $users->orderBy($sortField, $sortDirection);
		$users->paginate(10);
		$queries = DB::getQueryLog();
		$last_query = end($queries);
		dd($last_query);*/

		return $users->paginate(10);
    }

    public function show($id)
    {
		return User::find($id);
    }

    public function update($id, UpdateMemberRequest $request)
    {

		$user = User::find($id);
        $user->email = Input::get('email');
        $user->gender = Input::get('gender');
        $user->firstname = Input::get('firstname');
        $user->lastname = Input::get('lastname');
        $user->phone = Input::get('phone');
		$user->mobile = Input::get('mobile');
        $user->fax = Input::get('fax');
        $user->notes = Input::get('notes');
        $user->website = Input::get('website');
        $user->about = Input::get('about');
        $user->is_admin = Input::get('is_admin');
		$user->is_advertiser = Input::get('is_advertiser', 0);
		$user->is_seller = Input::get('is_seller', 0);
		$user->is_prospect = Input::get('is_prospect', 0);

        if(Input::get('password'))
            $user->password = Hash::make(Input::get('password'));
        if( Input::get('admin_permissions')) {
            $user->admin_permissions = json_encode(Input::get('admin_permissions'));
        }
		$user->save();

		return $user;
    }

    public function destroy($member_id) {
        $member = User::find($member_id);
        if(!$member->delete()) {

            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $member->errors()
                ),
                403
            );
        } else {
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }

	/*
	 *
	 * If user is an advertizer save, if it's only a prospect then no need to do anything complicated
	 *
	 */
    public function store(CreateMemberRequest $request)
    {

		$user = new User;
		$user->email = Input::get('email');
		$user->gender = Input::get('gender');
		$user->firstname = Input::get('firstname');
		$user->lastname = Input::get('lastname');
		$user->phone = Input::get('phone');
		$user->notes = Input::get('notes');
		$user->is_advertiser = Input::get('is_advertiser', 0);
		$user->is_seller = Input::get('is_seller', 0);
		$user->is_prospect = Input::get('is_prospect', 0);
		$user->username = Input::get('username');
		$user->confirmation_code = md5(uniqid(mt_rand(), true));
		$user->confirmed = 1;
		$user->password = Hash::make(Input::get('password'));

        if(Input::get('is_admin')) {
            $user->is_admin = Input::get('is_admin');
            $user->admin_permissions = json_encode(Input::get('admin_permissions'));
        }

		#dd($user);
		/*if (!Input::has('username') && !Input::has('password') && !Input::has('password_confirmation') && !Input::has('is_advertiser'))
		{
			//App::bind('confide.user_validator', 'Zizaco\Confide\UserProspectValidator');
		} else {
			$user->username = Input::get('username');
			$user->is_advertiser = Input::get('is_advertiser');

			//confirm the user
			$user->confirmation_code = md5(uniqid(mt_rand(), true));
			$user->confirmed = 1;

            //
            $user->password = Hash::make(Input::get('password'));
		}*/

		if($user->save()) {
            //Log::info('Created user "'.$user->username.'" <'.$user->email.'>');
            return Response::json(
                array(
                    'status' => 'success',
                    'user' => $user->toArray()
                ),
                200
            );
		}

		return $user;
    }

}
