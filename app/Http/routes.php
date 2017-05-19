<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

/*
 *
 * OAuth authorization
 *
 */

Route::group(array('prefix' => 'admin', 'before' => ''), function() {
    Route::post('auth/sign_in', 'Auth\AuthController@signIn');
    Route::get('auth/validate_token', array('before' => 'oauth', 'uses' => 'Auth\AuthController@validateToken'));
    Route::delete('auth/sign_out', array('before' => 'oauth', 'uses' => 'Auth\AuthController@signOut'));
    Route::controller('auth', 'Auth\AuthController');

    Route::delete('oauth/access_token', array('uses' => 'Auth\AuthController@issueAccessToken'));

});

/*
 *
 * Admin routes
 *
 */
Route::group(array('prefix' => 'api', 'before' => ''), function() {
        Route::resource('property-types', 'Admin\PropertyTypesController');
});

Route::group(array('prefix' => 'admin/api', 'before' => 'oauth'), function() {
    Route::resource('members', 'Admin\MembersController');
    Route::resource('prospects', 'Admin\ProspectsController');

    Route::get('content/config', array('as' => 'showContentConfig', 'uses' => 'Admin\ContentController@getConfig'));
    Route::get('content/{id}/{lang}', array('as' => 'showContent', 'uses' => 'Admin\ContentController@show'));
    Route::put('content/{page_id}/{lang}/{translation_id}', array('as' => 'updateContent', 'uses' => 'Admin\ContentController@update_translation'));
    Route::resource('content', 'Admin\ContentController');
    Route::resource('menu', 'Admin\MenuController');

    Route::post('language/save-order', array('as' => 'admin.api.language.save_order', 'uses' => 'Admin\LanguageController@saveOrder'));
    Route::get('language/options', array('as' => 'admin.api.language.options', 'uses' => 'Admin\LanguageController@options'));
    Route::resource('language', 'Admin\LanguageController');

    Route::resource('transactions', 'Admin\TransactionsController');

    Route::post('regions/{region_id}/{locale}/{translation_id}', array('as' => 'saveContent', 'uses' => 'Admin\RegionsController@saveRegion'));
    Route::get('regions/{id}/{locale}', array('as' => 'showContent', 'uses' => 'Admin\RegionsController@show'));
    Route::resource('regions', 'Admin\RegionsController');

    Route::get('settings/options', array('as' => 'getOptions', 'uses' => 'Admin\SettingsController@getOptions'));
    Route::post('settings/upload', array('as' => 'uploadLogo', 'uses' => 'Admin\SettingsController@uploadLogo'));
    Route::resource('settings', 'Admin\SettingsController');
    Route::post('payment-methods/save-order', array('as' => 'admin.api.payment-methods.save_order', 'uses' => 'Admin\SettingsPaymentMethodsController@saveOrder'));
    Route::resource('payment-methods', 'Admin\SettingsPaymentMethodsController');

    Route::post('property-types/save-order', array('as' => 'admin.api.property-types.save-order', 'uses' => 'Admin\PropertyTypesController@save_order'));
    Route::resource('property-types', 'Admin\PropertyTypesController');

    Route::resource('packages', 'Admin\PackagesController');


    #property management
    Route::post('property/{id}/locale/{locale}', array('as' => 'updatePropertyTranslation', 'uses' => 'Admin\PropertyController@update_translation'));
    Route::post('property/{id}', array('as' => 'updateProperty', 'uses' => 'Admin\PropertyController@update'));
    Route::post('property/{id}/upload', array('as' => 'uploadImage', 'uses' => 'Admin\PropertyController@uploadImage'));
    Route::post('property/{id}/update_virtual_tours', array('as' => 'uploadImage', 'uses' => 'Admin\PropertyController@updateVirtualTours'));
    Route::post('property/{id}/update_image', array('as' => 'uploadImage', 'uses' => 'Admin\PropertyController@updateImage'));
    Route::post('property/{id}/delete_image', array('as' => 'deleteImage', 'uses' => 'Admin\PropertyController@deleteImage'));
    Route::resource('property', 'Admin\PropertyController');


    Route::post('search-criteria-types/save-order', array('as' => 'admin.api.search-criteria-types.save-order', 'uses' => 'Admin\SearchCriteriaTypesController@save_order'));
    Route::resource('search-criteria-types', 'Admin\SearchCriteriaTypesController');
});

/*
 *
 * Frontend routes
 *
 */
$locales = Config::get('app.available_locales');
$locale = App::getLocale();

if(count($locales) == 1) {
    $prefix = '';
} else {
    $prefix = $locale;
}
Config::set('route.prefix', $prefix);

//images
Route::any('property_images/{type}/{id}/{imageType}-{path?}', 'ImageController@getIndex')->where('path', '.+');

Route::group(array('prefix' => $prefix, 'middleware' => 'csrf'), function() {

    //:: Basic routes ::
    Route::get(Lang::get('routes.global_search'), array('as' => Lang::get('routes.global_search'), 'uses' => 'ListingsController@globalSearch'));
    Route::get(Lang::get('routes.listings'), array('as' => Lang::get('routes.listings'), 'uses' => 'ListingsController@getIndex'));
    Route::get(Lang::get('routes.for_sale'), array('as' => Lang::get('routes.for_sale'), 'uses' => 'ListingsController@getForSale'));
    Route::get(Lang::get('routes.to_rent'), array('as' => Lang::get('routes.to_rent'), 'uses' => 'ListingsController@getToRent'));
    Route::get(Lang::get('routes.property/{id}/{slug?}'), array('as' => Lang::get('routes.property'), 'uses' => 'PropertyController@getIndex'))->where('id', '[0-9]+');
    Route::get(Lang::get('routes.favourite-{id}'), array('as' => Lang::get('routes.favourite'), 'uses' => 'PropertyController@getFavourite'))->where('id', '[0-9]+');

    //:: User auth routes ::
    Route::get(Lang::get('routes.auth/register'), array('as' => Lang::get('routes.auth/register'), 'uses' => 'User\AuthController@getRegister'));
    Route::post(Lang::get('routes.auth/register'), array('as' => Lang::get('routes.auth/register'), 'uses' => 'User\AuthController@postRegister'));

    Route::controller('auth', 'User\AuthController', [
        'getIndex'  => 'auth.index',
        'postIndex' => 'auth.index.submit',
        'getRegister'  => 'auth.register',
        'postRegister' => 'auth.register.submit',
        'getLogin'  => 'auth.login',
        'postLogin' => 'auth.login.submit',
        'getLogout'  => 'auth.logout',
    ]);
    Route::controller('password', 'User\PasswordController', [
        'getEmail'  => 'password.email',
        'postEmail' => 'password.email.submit',
        'getReset'  => 'password.reset',
        'postReset' => 'password.reset.submit',
    ]);
    Route::get(Lang::get('routes.auth/login'), array('as' => Lang::get('routes.auth/login'), 'uses' => 'User\AuthController@getLogin'));
    Route::get(Lang::get('routes.auth/logout'), array('as' => Lang::get('routes.auth/logout'), 'uses' => 'User\AuthController@getLogout'));
    Route::get(Lang::get('routes.auth/register'), array('as' => Lang::get('routes.auth/register'), 'uses' => 'User\AuthController@getRegister'));
    Route::get(Lang::get('routes.auth/forgot'), array('as' => Lang::get('routes.auth/forgot'), 'uses' => 'User\PasswordController@getForgot'));

    Route::get('/', array('as' => Lang::get('routes.home'), 'uses' => 'HomeController@getIndex'));

});

Route::group(array('prefix' => $prefix, 'middleware' => 'csrf'), function()
{

    //:: User Account Routes ::

    Route::get(Lang::get('routes.user/dashboard'), array('as' => Lang::get('routes.user/dashboard'), 'uses' => 'User\DashboardController@getIndex'));
    Route::get(Lang::get('routes.user/change-password'), array('as' => Lang::get('routes.user/change-password'), 'uses' => 'User\AccountController@getIndex'));
    Route::get(Lang::get('routes.user/profile'), array('as' => Lang::get('routes.user/profile'), 'uses' => 'User\ProfileController@getIndex'));
    Route::get(Lang::get('routes.user/favourites'), array('as' => Lang::get('routes.user/favourites'), 'uses' => 'User\FavouritesController@getIndex'));
    Route::get(Lang::get('routes.user/delete_favourite/{id}'), array('as' => 'routes.user/delete_favourite', 'uses' => 'User\FavouritesController@getRemove'))->where('id', '[0-9]+');

    Route::post(Lang::get('routes.user/profile'), array('uses' => 'User\ProfileController@postIndex'));
    Route::post(Lang::get('routes.user/account'), array('uses' => 'User\AccountController@postIndex'));
});

Route::post('property/email', 'PropertyController@sendEmail');

Route::group(array('prefix' => $prefix, 'middleware' => 'csrf'), function() {
	Route::post(Lang::get('routes.contact'), array('uses' => 'ContactController@postIndex'));
	Route::post('contact', array('as' => 'contact', 'uses' => 'ContactController@postIndex'));
});
Route::get('/dashboard', ['uses' => 'User\DashboardController@getIndex']);
Route::get('/home', ['uses' => 'User\DashboardController@getIndex']);

Route::any('map/search', 'MapController@getProperties');
Route::controller('installer', 'Installer\StartController');

#this is the multilingual landing page
if(count($locales) > 1) {
    Route::get('/', 'LandingController@getIndex'); //give em a choice, unless we can detect the lang!
}
