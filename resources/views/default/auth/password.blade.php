@extends('layouts.default')

{{-- Web site Title --}}
@section('title')
{{{ Lang::get('user/user.register') }}} ::
@parent
@stop

{{-- Content --}}
@section('content')
<br />
<br />
	<div class="row">
		<div class="col-md-8 col-md-offset-2">
			
			
										<h2><?= __('Reset Password') ?></h2><hr />
							<p><?= __("Enter the e-mail address associated with your account, then click Continue. We'll email you a link to a page where you can easily create a new password.") ?></p>
							
					@if (session('status'))
						<div class="alert alert-success">
							{{ session('status') }}
						</div>
					@endif

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

					<form class="form-horizontal" role="form" method="POST" action="{{ route('password.email') }}">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">

						<div class="form-group">
							<label class="col-md-4 control-label">{{ ('E-Mail Address') }}</label>
							<div class="col-md-6">
								<input type="email" class="form-control" name="email" value="{{ old('email') }}">
							</div>
						</div>

						<div class="form-group">
														<label class="col-md-4 control-label">&nbsp;</label>

							<div class="col-md-6">
								<button type="submit" class="btn btn-primary">
									{{ ('Continue') }}
								</button>
							</div>
						</div>
					</form>
				</div>
				</div>


<br />
<br />
@endsection
