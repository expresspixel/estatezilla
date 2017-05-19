<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;


use Input;
use Authorizer;
use Response;
use App\Models\Prospect;

class ProspectsController extends Controller
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
		
		$prospects = new Prospect();
        $prospects = $prospects->where('id', '>', 0);
		
		if($search) {
			$search = "".$search."%";

            $prospects->where(function($query) use ($search)
			{
				$where = ['email','firstname','lastname','phone'];
				foreach ($where as $field) {
					$query->orWhere($field, 'LIKE', $search);
				}
			});
		}
        $prospects = $prospects->orderBy($sortField, $sortDirection);
		
		return $prospects->paginate(10);
    }

    public function destroy($prospect_id) {
        $prospect = Prospect::find($prospect_id);
        if(!$prospect->delete()) {

            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $prospect->errors()
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

}
