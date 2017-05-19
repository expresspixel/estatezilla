<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LocaleCreateRequest;
use App\Http\Requests\LocaleUpdateRequest;
use App\Http\Requests\MenuCreateRequest;
use App\Http\Requests\MenuUpdateRequest;
use App\Models\Locale;
use App\Models\PaymentMethod;
use Setting;
use Illuminate\Support\Facades\Log;
use Input;
use Authorizer;
use Response;
use Config;
use App\Models\Menu;

class SettingsPaymentMethodsController extends Controller
{
    protected $authorizer;

    public function __construct(Authorizer $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    public function index()
    {
		return PaymentMethod::orderBy('position', 'DESC')->get();
    }

    public function saveOrder() {
        $payments = Input::get('payments');

        foreach($payments as $k => $payment_new) {
            $payment = PaymentMethod::find($payment_new['id']);
            $payment->position = $k;
            $payment->save();
        }
        return Response::json(
            array(
                'status' => 'success'
            ),
            200
        );
    }

    public function update($id)
    {
        $payment_method = PaymentMethod::find($id);
        $settings = Config::get('payment-methods');

        $updated_settings = Input::get('settings');

        foreach($updated_settings as $key => $value) {
            $settings[$payment_method->handle][$key] = $value;
        }

        $results = "<?php\n";
        $results .= "return ";
        $results .= var_export($settings, true);
        $results .= ";\n";
        file_put_contents(base_path('config') . '/payment-methods.php', $results);

        return Response::json(
            array(
                'status' => 'success'
            ),
            200
        );
    }
	
}
