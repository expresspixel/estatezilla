<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchCriteriaType extends Model {

    public function property_types()
    {
        return $this->hasMany('\App\Models\PropertyType');
    }

}
