<?php namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prospect extends Model {

    use SoftDeletes;

    protected $appends = array('registered_at');
    protected $dates = ['deleted_at'];

    public function getRegisteredAtAttribute($value)
    {
        $now = Carbon::now();
        $difference = ($this->created_at->diff($now)->days < 1)
            ? $this->created_at->diffForHumans()
            : $this->created_at->toFormattedDateString();
        return $difference;
    }


}
