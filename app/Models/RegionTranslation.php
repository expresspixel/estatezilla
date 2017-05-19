<?php namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RegionTranslation extends Model {

    public function getValueAttribute($value)
    {
        if(!is_null($value))
            return json_decode($value);
        return [];
    }


}
