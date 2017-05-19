@extends('layouts.default')

@section('title')
{{{ Lang::get('user/user.register') }}} ::
@parent
@stop

{{-- Content --}}
@section('content')

<div class="container">
	<div class="row">
		<div class="col-md-8 col-md-offset-2">
			
										<h2><?= __('Reset Password') ?></h2><hr />
							<p><?= __("We'll ask you for your password when you submit a listing or save your favorite properties") ?></p>
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

					<form class="form-horizontal" role="form" method="POST" action="{{ URL::route('password.reset') }}">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">
						<input type="hidden" name="token" value="{{ $token }}">

						<div class="form-group">
							<label class="col-md-4 control-label">{{('E-Mail Address')}}</label>
							<div class="col-md-6">
								<input type="email" class="form-control" name="email" value="{{ old('email') }}">
							</div>
						</div>

						<div class="form-group">
							<label class="col-md-4 control-label">{{('Password')}}</label>
							<div class="col-md-6">
								<input type="password" class="form-control" name="password">
							</div>
						</div>

						<div class="form-group">
							<label class="col-md-4 control-label">{{('Confirm Password')}}</label>
							<div class="col-md-6">
								<input type="password" class="form-control" name="password_confirmation">
							</div>
						</div>

						<div class="form-group">
														<label class="col-md-4 control-label"></label>

							<div class="col-md-6">
								<button type="submit" class="btn btn-primary">
									{{('Reset Password')}}
								</button>
							</div>
						</div>
					</form>

	</div>
</div>
@endsection
