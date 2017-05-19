<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model {

    public static function getValue($key) {
        $setting = Setting::where('key', $key)->first();
        if($setting)
            return $setting->value;
        return false;
    }

}
