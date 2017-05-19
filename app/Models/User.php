<?php namespace App\Models;

use Carbon\Carbon;
use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model implements AuthenticatableContract, CanResetPasswordContract {

	use SoftDeletes, Authenticatable, CanResetPassword;

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = ['email', 'password', 'phone', 'confirmation_code'];

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = ['password', 'remember_token'];

    protected $dates = ['deleted_at'];
    protected $appends = array('registered_at', 'role_formatted', 'logo');

    public function getDates()
    {
        /* substitute your list of fields you want to be auto-converted to timestamps here: */
        return array('created_at', 'updated_at', 'deleted_at');
    }


    public function getAdminPermissionsAttribute($value)
    {
        if(!is_null($value))
            return json_decode($value);
        return [];
    }

    public function getIsAdminAttribute($value)
    {
        return ($value == 1);
    }
    public function getIsAdvertiserAttribute($value)
    {
        return ($value == 1);
    }

    public function setRegisteredAtAttribute($value)
    {
        return $this->attributes['registered_at'] = $value;
    }

    public function getRegisteredAtAttribute($value)
    {
        $now = Carbon::now();
        $difference = ($this->created_at->diff($now)->days < 1)
            ? $this->created_at->diffForHumans()
            : $this->created_at->toFormattedDateString();
        return $difference;
    }

    public function getRoleFormattedAttribute($value)
    {
        if($this->is_admin) {
            return "Adminstrator";
        }
        if($this->is_advertiser) {
            return "Estate Agent";
        }
        if(!$this->confirmation_code) {
            return "Not validated";
        }
        return "Member";

    }

    public function subscription(){
        return false;
    }

    public function joined()
    {
        return Carbon::createFromFormat('Y-n-j G:i:s', $this->created_at);
    }

    public function property_count(){
        return Property::where('user_id', '=', $this->id)->count();
    }

    public function getLogoAttribute()
    {
		$hash_folder = md5($this->id)[0]."/".md5($this->id)[1];
        $hash_path = asset('media/agents/'.$hash_folder.'/'.md5($this->id).'/logo.jpg');
		return  $hash_path;
    }


}
