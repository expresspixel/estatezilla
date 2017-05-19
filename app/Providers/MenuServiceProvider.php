<?php
namespace App\Providers;

use App\Models\Menu;
use App\Models\Page;
use App\Models\PageTranslation;
use Nav;
use Config;
use Illuminate\Support\ServiceProvider;

class MenuServiceProvider extends ServiceProvider
{
    /**
     * Boot the service provider.
     *
     * @return void
     */
    public function boot()
    {
		//needs to be called only if frontend and not every request!
		try{
			$menus = Menu::get();
		}catch(\Exception $e){
			//echo $e->getMessage();
			return;
		}
		
        $navigation_menu = [];
        foreach($menus as $menu) {
            $menu_data = json_decode($menu->data);
            if($menu_data) {
                foreach ($menu_data as $menu_locale => $menu_items) {
                    $navigation_menu[$menu_locale][$menu->handle] = $menu_items;
                }
            }

        }
		
        $navigation = false;
        if(isset($navigation_menu[Config::get( 'app.locale' )])) {
           $navigation = $navigation_menu[Config::get( 'app.locale' )];
        }

        $pages = PageTranslation::where('locale', Config::get( 'app.locale' ))->get();
        $slugs = [];
        $available_locales = Config::get('app.available_locales');
        foreach($pages as $page) {
			
            if(count($available_locales) > 1) {
                $slugs[$page->page_id] = url($page->locale ."/" . $page->slug);
            } else {
                $slugs[$page->page_id] = url($page->slug);
            }
        }
		
		
        if($navigation) {
            foreach($navigation as $handle => $nav) {
                Nav::make($handle, function($menu) use ($nav, $slugs) {
    				
                    foreach($nav as $item) {
                        if($item->type == 'page') {
                            if(isset($item->value) && isset($slugs[$item->value->id])) {
                                $menu->add($item->title, $slugs[$item->value->id]);
                            }
                        }

                        if($item->type == 'url') {
                            $menu->add($item->title, $item->value->url);
                        }
                    }
                });
            }
        }
		
		
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // 
    }
}