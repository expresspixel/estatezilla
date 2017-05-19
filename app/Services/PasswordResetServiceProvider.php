<?php namespace App\Services;

use Closure;
use Illuminate\Contracts\Auth\PasswordBroker as PasswordBrokerContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

use Illuminate\Auth\Passwords\PasswordBroker as BasePasswordBroker;

class PasswordBroker extends BasePasswordBroker implements PasswordBrokerContract
{
    public function emailResetLink(CanResetPasswordContract $user, $token, Closure $callback = null)
    {
        $view = $this->emailView;
dd($view);
        // edit whatever here
        return $this->mailer->send($view, compact('token', 'user'), function($m) use ($user, $token, $callback)
        {
            $m->to($user->getEmailForPasswordReset());

            if ( ! is_null($callback)) call_user_func($callback, $m, $user, $token);
        });
    }
}