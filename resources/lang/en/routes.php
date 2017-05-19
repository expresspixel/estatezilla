<?php 

return array(
    
	'auth/login'         => 'auth/login',
	'auth/register'      => 'auth/register',
	'auth/forgot'      	 => 'auth/forgot',
	'user/dashboard'     => 'user/dashboard',
	'user/account'       => 'user/account',
	'user/profile'       => 'user/profile',
	'user/change-password'       => 'user/change-password',
	'user/favourites'  	 => 'user/favourites',
	'user/saved_searches'  	 => 'user/saved_searches',
	/*'home'  		    => 'home',
	'listings'  		 => 'listings',
	'property'  		 => 'property',
	'for_sale'   		 => 'for-sale',
	'to_rent'   		 => 'to-rent',
	'global_search'   	 => 'global_search',*/
	'property/{id}/{slug?}'   	 => 'property/{id}/{slug?}',
	'favourite-{id}'   	 => 'favourite-{id}',

);