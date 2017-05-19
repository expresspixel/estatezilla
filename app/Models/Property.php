<?php namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Slugify;
use Config;
use Setting;

class Property extends Model {

	use \Dimsav\Translatable\Translatable;

	public $translatedAttributes = array('title', 'summary');
    protected $fillable = ['title', 'property_type_id', 'listing_status'];
    protected $appends = array('price_formatted', 'main_image', 'url');

    public static function boot()
    {
        parent::boot();

        // cause a delete of a product to cascade to children so they are also deleted
        static::deleted(function($property)
        {
            $property->translations()->delete();
        });
    }
    public function getUrlAttribute()
    {
        if($this->title)
            $slug = Slugify::slugify($this->title);
        elseif($this->displayable_address)
            $slug = Slugify::slugify($this->displayable_address);
        else
            $slug = '';
		return route_lang('property', ['id' => $this->id, 'slug' => $slug]);
    }
	public function url() {
        if($this->title)
            $slug = Slugify::slugify($this->title);
        elseif($this->displayable_address)
            $slug = Slugify::slugify($this->displayable_address);
        else
            $slug = '';
		return route_lang('property', ['id' => $this->id, 'slug' => $slug]);
	}

    public function agent()
    {
        return $this->belongsTo('\App\Models\User', 'user_id', 'id');
    }

    public function translations()
    {
        return $this->hasMany('\App\Models\PropertyTranslation');
    }

    public function getPhotosAttribute($data)
    {
		if(!$data)
			return [];
        return json_decode($data);
    }
    public function getFloorPlansAttribute($data)
    {
        return json_decode($data);
    }
    public function getDocumentsAttribute($data)
    {
        return json_decode($data);
    }
    public function getVirtualToursAttribute($data)
    {
        return json_decode($data);
    }
    public function getPriceFormattedAttribute()
    {
        #dd($this->price);
        return $this->priceFormatted($this->price);
    }
    public function getMainImageAttribute($data, $size = 'thumbs')
    {
        if (isset($this->photos[0])) {
            $str = URL::to("property_images/$size/$this->id/photos-".$this->photos[0]->file);
        } else {
            $str = URL::to("property_images/$size/$this->id/no-image.jpg");
        }
        return $str;
    }
    public function thumbnail($size = 'thumb')
    {
        if (isset($this->photos[0])) {
            $str = URL::to("property_images/$size/$this->id/photos-".$this->photos[0]->file);
        } else {
            $str = URL::to("property_images/$size/$this->id/no-image.jpg");
        }
        return $str;
    }

    public function property_type() {
        return $this->belongsTo('\App\Models\PropertyType');
    }
    public function singlePhoto($file, $size)
    {
        $str = URL::to("property_images/$size/$this->id/photos-".$file);
        return $str;
    }

    public function priceFormatted($price = null)
    {
        if(is_null($price)) {
            $price = $this->price;
        }
        if(!is_numeric($price)){
            return "N/A";
        }

        if($this->poa) {
            return _l('POA');
        }

        $nf = new \NumberFormatter(Config::get('app.locale') . "_" .Setting::get('default_country'), \NumberFormatter::CURRENCY);
		$nf->setAttribute(\NumberFormatter::MAX_FRACTION_DIGITS, 0);
        $nf->formatCurrency($price, Setting::get('default_currency'));

		numfmt_set_attribute($nf, \NumberFormatter::MAX_FRACTION_DIGITS, 0);
        $price_string = numfmt_format($nf, $price);
		$price_string = str_replace(Setting::get('default_country'), "", $price_string);

        if($this->listing_type == 'rent') {
            if($this->price_period) {
                $price_string .= " "._l($this->price_period);
            }
            if($this->price_type) {
                //$price_string .= " "._l($this->price_type);
            }
        }

		return $price_string;

    }
    public function creation_date($date=null)
    {
        if(is_null($date)) {
            $date = $this->created_at;
        }

        return String::date($date);
    }

    public function days_to_expire($expires_at=null)
    {

        if(is_null($expires_at)) {
            $expires_at = $this->expires_at;
        }
        if(is_null($expires_at)) {
            $expires_at =  date( 'Y-m-d');
        }
        #var_dump($expires_at);
        #return 5;die();

        #$expires_at =  date( 'Y-m-d H:i:s');
        $exp_date = Carbon::createFromFormat('Y-m-d', $expires_at);
        #dd($exp_date);
        $diff = Carbon::now()->diffInDays($exp_date, false);
        return (int) $diff;
    }

    public function next_expiry_date($expires_at=null)
    {
        if(is_null($expires_at)) {
            $expires_at = $this->expires_at;
        }
        if(!$expires_at) {
            $expires_at =  date( 'Y-m-d H:i:s');
        }

        //if expired use date from now
        $exp_date = Carbon::createFromFormat('Y-m-d H:i:s', $expires_at);
        $diff = Carbon::now()->diffInDays($exp_date, false);

        if($diff <= 0) {
            $exp_date = Carbon::now();
        }

        $exp_date->modify('+1 month');

        return $exp_date;
        return String::date($exp_date);
    }
}
