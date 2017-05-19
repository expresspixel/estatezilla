<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Models\Package;
use App\Models\Property;
use App\Models\PropertyTranslation;
use App\Models\PropertyType;
#use Illuminate\Http\Request;
use Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use App\Models\User;
use App\Models\Page;
use App\Models\PageTranslation;

class PackagesController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function index()
    {

        $packages = new Package();
        $packages = $packages->orderBy('price', 'DESC');

        return $packages->get();
    }

    public function update($id)
    {

        //do nothing
        $package = Package::find($id);
        $package->name = "Credits ". Input::get('credits');
        if($package->monthly)
            $package->name = "Premium";
        $package->credits = Input::get('credits');
        $package->price = Input::get('price');

        if (!$package->save()) {
            Log::info('Unable to create menu ' . $package->name, (array)$package->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $package->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "' . $package->menu . '" <' . $package->price . '>');
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }

    public function destroy($id)
    {
        $package = Package::find($id);
        if (!$package->delete()) {
            Log::info('Unable to create menu ' . $package->name, (array)$package->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $package->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "' . $package->name . '" <' . $package->name . '>');
            return Response::json(
                array(
                    'status' => 'success'
                ),
                200
            );
        }
    }

    public function store()
    {
        $package = new Package();
        $package->name = "Credits ". Input::get('credits');
        $package->credits = Input::get('credits');
        $package->price = Input::get('price');

        if (!$package->save()) {
            Log::info('Unable to create menu ' . $package->name, (array)$package->errors());
            return Response::json(
                array(
                    'status' => 'error',
                    'errors' => $package->errors()
                ),
                403
            );
        } else {
            Log::info('Created menu "' . $package->name . '" <' . $package->handle . '>');
            return Response::json(
                array(
                    'status' => 'success',
                    'menu' => $package->toArray()
                ),
                200
            );
        }

        return $package;
    }
}