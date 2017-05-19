<?php namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Region extends Model {
    use \Dimsav\Translatable\Translatable;
	use SoftDeletes;

    public $translatedAttributes = ['value'];
    protected $fillable = ['value'];

    public function translations()
    {
        return $this->hasMany('\App\Models\RegionTranslation');
    }


}
