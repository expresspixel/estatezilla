<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyType extends Model {

    public function search_criteria_type()
    {
        return $this->belongsTo('\App\Models\SearchCriteriaType');
    }

}
