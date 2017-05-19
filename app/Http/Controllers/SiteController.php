<?php namespace App\Http\Controllers;


use App\Models\Locale;
use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\Region;
use Config;
use Cookie;
use Redirect;
use Session;
use Gettext\Translator;
use Gettext\Translations;
use View;
use Route;
use Lang;
use Menu;
use Request;
use Theme;
use Shortcode;
use Html;
use DB;
use Response;
use Setting;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\SearchCriteriaType;

class SiteController extends Controller {

    /**
     * Inject the models.
     */
    public $settings;
    public $menus;
    public $region_list;
    protected $page;
    protected $translation;

    public function __construct()
    {
		    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
        $theme = Setting::get('theme', 'default');
        if(!file_exists(base_path('resources/views/'.$theme.'/config.php'))) {
          $theme = 'default';
        }

        Theme::set($theme);
        $current_locale = Config::get( 'app.locale' );

        $t = new Translator();
		    if(file_exists(base_path('resources/views/'.Theme::get().'/po/'.$current_locale.'.po')))
			     $t->loadTranslations(Translations::fromPoFile(base_path('resources/views/'.Theme::get().'/po/'.$current_locale.'.po')));
		    if(file_exists(base_path('resources/po/'.$current_locale.'.po')))
			     $t->loadTranslations(Translations::fromPoFile(base_path('resources/po/'.$current_locale.'.po')));
        Translator::initGettextFunctions($t);

        View::share('current_lang', $current_locale);
        View::share('current_locale', $current_locale);
        View::share('website_name', Setting::get('website_name'));

    		try {
    			DB::connection();
    		} catch(\Exception $e) {
    			#redirect('installer');
    			die('Database error: '.$e->getMessage());
    		}

        $locales = Locale::where('visible', 1)->get();
        $available_locales = [];
        foreach($locales as $locale) {
            $available_locales[$locale->code] = $locale->name;
        }

        View::share('available_locales', $available_locales);

        #$currencyRepository = new CurrencyRepository;
        #$numberFormatRepository = new NumberFormatRepository;
        #$currency = $currencyRepository->get(Setting::get('default_currency'));
		$currency = Setting::get('default_currency');
        View::share('currency', $currency);

        $this->settings = Setting::all();
        View::share('settings', $this->settings);


        //get the current slug
        $slug = Request::path();
        $slug= ltrim ($slug, '/');
        if(count(Config::get('app.available_locales')) > 1){
            $pos = strpos($slug,$current_locale);
            if ($pos !== false) {
                $slug = substr_replace($slug,'',$pos,strlen($current_locale));
            }
            $slug= ltrim ($slug, '/');
        }

        View::share('page_title', "");
        View::share('meta_description', "");
        View::share('meta_keywords', "");

        //let's see if we have a translation
        $this->translation = PageTranslation::where('slug', '=', $slug)
            ->where('locale', '=', $current_locale)
            ->first();

        if($this->translation) {
            View::share('page_title', $this->translation->title);
            View::share('meta_description', $this->translation->seo_meta_description);
            View::share('meta_keywords', $this->translation->seo_meta_keywords);

            //load the regions
            $regions = Region::where('page_id', $this->translation->page_id)->get();
            $region_list = [];
            foreach($regions as $region) {
                $this->region_list[$region->handler] = $region->value;
            }
            View::share('regions', $this->region_list);
			      $this->page = Page::find($this->translation->page_id);
        }


        $page_handlers = Page::whereNotNull('handler')->where('handler', '!=', '')->get()->lists('handler', 'id');
        $translations = PageTranslation::whereIn('page_id', array_keys($page_handlers))->where('locale', $current_locale)->get();
        $handlers = [];
        foreach($translations as $translation) {
          if(count(Config::get('app.available_locales')) > 1)
            $handlers[$page_handlers[$translation->page_id]] = $translation->locale .'/'. $translation->slug;
          else
            $handlers[$page_handlers[$translation->page_id]] = $translation->slug;
        }
        Config::set('page_handlers', $handlers);
        $this->getFilters();
    }


    public function getFilters() {
        $options = [];

        $radius_list = array();
        $radius_list['0'] = _l('This area only');
        $radius_list['0.25'] = _l('Within &frac14; mile');
        $radius_list['0.5'] = _l('Within &frac12; mile');
        $radius_list[1]  =  sprintf(_l('Within %s mile'), 1);
        $radius_list[3]  = sprintf(_l('Within %s mile'), 3);
        $radius_list[5]  =  sprintf(_l('Within %s mile'), 5);
        $radius_list[10] = sprintf(_l('Within %s mile'), 10);
        $radius_list[15] = sprintf(_l('Within %s mile'), 15);
        $radius_list[20] = sprintf(_l('Within %s mile'), 20);
        $radius_list[30] = sprintf(_l('Within %s mile'), 30);
        $radius_list[40] = sprintf(_l('Within %s mile'), 40);

        $bed_from = array();
        $bed_from[0] = _l('No min');
        $bed_from[1] = '1';
        $bed_from[2] = '2';
        $bed_from[3] = '3';
        $bed_from[4] = '4';
        $bed_from[5] = '5';

        $bed_to = array();
        $bed_to[0] = _l('No max');
        $bed_to[1] = '1';
        $bed_to[2] = '2';
        $bed_to[3] = '3';
        $bed_to[4] = '4';
        $bed_to[5] = '5';
        $bed_to['INF'] = '6+';

        $size_list = array(100,200,300,400,500,750,1000,1250,1500,1750,2000,2500,5000,7500,10000,20000,50000,75000,100000,150000,200000);
        $size_from = array();
        $size_from[0] = _l('No min');
        foreach($size_from as $size) {
            $size_from[$size] = $size;
        }
        $size_to = array();
        $size_to[0] = _l('No max');
        foreach($size_to as $size) {
            $size_to[$size] = $size;
        }
        $size_to['INF'] = '5+';

        $days_search = array();
        $days_search[0] = _l('Anytime');
        $days_search[1] = _l('Last 24 hours');
        $days_search[3] = _l('Last 3 days');
        $days_search[7] = _l('Last 7 days');
        $days_search[14] = _l('Last 14 days');

        $criteria_list = SearchCriteriaType::with('property_types')->get();
        $criteria_main = [];
        $criteria_main[0] = _l('Any');
        foreach ($criteria_list as $criteria) {
            $criteria_main[$criteria->id] = _l($criteria->name);
        }

        $conditions = [
            'new' => _l('New'),
            'pre_owned' => _l('Pre-owned'),
        ];
        $features = [
            'has_parking' => _l('Has parking'),
            'has_garden' => _l('Has garden'),
            'is_investment_property' => _l('Investment property'),
        ];

        $min_price_list = [50000, 75000, 10000, 150000, 200000, 25000, 300000, 400000, 500000];
        $max_price_list = range(100000, 900000, 100000);
        $min_prices = [];
        $min_prices[] = _l('No min');
        foreach($min_price_list as $k => $v) {
            $min_prices[$v] = $this->convertMoney($v);
        }
        $max_prices = [];
        foreach($max_price_list as $k => $v) {
            $max_prices[$v] = $this->convertMoney($v);
        }
        $max_prices[0] = _l('No max');

		$options['min_price_list'] = $min_prices;
        $options['max_price_list'] = $max_prices;
        $options['criteria_list'] = $criteria_list;
        $options['criteria_main'] = $criteria_main;
        $options['radius_list'] = $radius_list;
        $options['bed_from'] = $bed_from;
        $options['bed_to'] = $bed_to;
        $options['size_from'] = $size_from;
        $options['size_to'] = $size_to;
        $options['days_search'] = $days_search;
        $options['conditions'] = $conditions;
        $options['features'] = $features;

        foreach($options as $option_key => $option_value) {
            View::share($option_key, $option_value);
        }

        return $options;
    }

    public function convertMoney($price) {
        $nf = new \NumberFormatter(Config::get('app.locale') . "-" .Setting::get('default_country'), \NumberFormatter::CURRENCY);
        $nf->setAttribute(\NumberFormatter::MAX_FRACTION_DIGITS, 0);
        $nf->formatCurrency($price, Setting::get('default_currency'));
        numfmt_set_attribute($nf, \NumberFormatter::MAX_FRACTION_DIGITS, 0);
        return numfmt_format($nf, $price);
    }


}
