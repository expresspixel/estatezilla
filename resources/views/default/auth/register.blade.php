@extends('layouts.default')

{{-- Web site Title --}}
@section('title')
{{{ Lang::get('user/user.register') }}} ::
@parent
@stop

{{-- Content --}}
@section('content')
	<br />
	<div class="row">
		<div class="col-sm-6 col-sm-offset-3">
			<h1 class="text-center"><?= __('Create an account') ?></h1><br />
		</div>
		<div class="col-sm-6 col-sm-offset-3">
			<div class="row">
				<div class="col-lg-12">
<div class="panel panel-default">
  <div class="panel-body">


					@if (count($errors) > 0)
						<div class="alert alert-danger">
							{{ ('<strong>Whoops!</strong> There were some problems with your input.') }}<br><br>
							<ul>
								@foreach ($errors->all() as $error)
									<li>{{ $error }}</li>
								@endforeach
							</ul>
						</div>
					@endif

					<form class="form-vertical" role="form" method="POST" action="<?= route_lang('auth/register') ?>">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">

										<div class="form-group">
					<label ><?= __('Full name') ?></label>
					<div class="row">
						<div class="col-sm-12">
							<input type="text" class="form-control " name="name" placeholder="<?= __('Enter your first name') ?>" value="{{{ old('name') }}}">
						</div>
					</div>

				</div>


				<div class="form-group">
					<label ><?= __('Email address') ?></label>
					<input type="email" class="form-control " name="email" id="email" value="{{{ old('email') }}}" placeholder="<?= __('Enter email') ?>">
				</div>
				<div class="form-group">
					<label for="exampleInputPassword1"><?= __('Password') ?></label>
					<input type="password" class="form-control" type="password" name="password" id="password" value="{{{ old('password') }}}" placeholder="<?= __('Enter a password') ?>">
				</div>
				<div class="form-group">
					<label for="exampleInputPassword1"><?= __('Confirm password') ?></label>
					<input type="password" class="form-control" type="password" name="password_confirmation" id="password_confirmation" value="{{{ old('password_confirmation') }}}" placeholder="<?= __('Confirm your password') ?>">
				</div>

				<div class="checkbox">
					<label>
						<input type="checkbox"> <?= __('We can contact you with relevant offers and news') ?>
					</label>
				</div>
				<br />
				<input type="hidden" name="coupon" value="{{{ Session::get('coupon') }}}" />
<div  class="text-center">
			  <button type="submit" class="btn btn-default btn-primary"><?= __('Create account') ?></button>
</div>

					</form>
				</div>
				</div>
				</div>
				</div>
				</div>



</div>
<br />
<br />
<br />
<br />
@endsection
