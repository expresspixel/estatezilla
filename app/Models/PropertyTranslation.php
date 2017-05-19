<?php namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyTranslation extends Model {
	
	
	public $timestamps = true;
    protected $fillable = ['title'];
    protected $hidden = ['content'];
	
	public function url() {
		$slug = Slugify::slugify($this->title);
		return url('properties/'.$this->id.'/'.$slug);
	}
	
	public function property()
    {
        return $this->belongsTo('\App\Models\Property');
    }	
	
	public function translations()
    {
        return $this->hasMany('\App\Models\PropertyTranslation', 'property_id', 'property_id');
    }
    public function getFeaturesAttribute($data)
    {
        return json_decode($data);
    }
    public function getPhotosAttribute($data)
    {
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
        if(!$data) {
            $data = [];
            $data[] = ['url' => '', 'caption' => ''];
            $data = json_encode($data);
        }
        return json_decode($data);
    }
}
