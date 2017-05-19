<h1>Welcome</h1>

<p>Hello {{$name}},</p>

<p>Please access the link below to confirm your account.</p>
<a href='{{{ URL::to("user/confirm/{$confirmation_code}") }}}'>
    {{{ URL::to("user/confirm/{$confirmation_code}") }}}
</a>

<p>Regards</p>
