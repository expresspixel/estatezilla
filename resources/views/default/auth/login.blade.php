@extends('layouts.default')

{{-- Web site Title --}}
@section('title')
{{{ Lang::get('user/user.register') }}} ::
@parent
@stop

{{-- Content --}}
@section('content')

	<div class="row">
		
		
		<div class="col-lg-12">			
			<br />
			<br />
			<div class="row">
				<div class="col-lg-6">
					<div class="row">
						<div class="col-lg-11">
<div class="panel panel-default">
  <div class="panel-body">
							<h2><?= __('Sign in') ?></h2>
							<p><?= __('If you have an account with us, please log in.') ?></p>

							@if ( Session::get('error') )
							<div class="alert alert-danger">{{ Session::get('error') }}</div>
							@endif

							@if ( Session::get('notice') )
							<div class="alert alert-info">{{ Session::get('notice') }}</div>
							@endif
							
							@if (count($errors) > 0)
								<div class="alert alert-danger">
									{{ ('Whoops! There were some problems with your input.') }}<br><br>
									<ul>
										@foreach ($errors->all() as $error)
											<li>{{ $error }}</li>
										@endforeach
									</ul>
								</div>
							@endif

							<?php echo Form::open(array('url' => route_lang('auth/login'))); ?>
							<input type="hidden" name="_token" value="{{ csrf_token() }}">
							
							  <div class="form-group">
							    <label><?= __('Email address') ?></label>
								<input type="email" class="form-control" name="email" value="{{ old('email') }}">
							  </div>
							  <div class="form-group">
							    <label><?= __('Password') ?></label>
								<input type="password" class="form-control" name="password">
							  </div>
							  <div class="checkbox">
							    <label>
									<input type="checkbox" name="remember"> <?= __('Remember me') ?>
							    </label>
							  </div>
							  <button type="submit" class="btn btn-primary"><?= __('Login') ?></button>
							</form>
			
							<div class="row">  
								<div class="col-lg-11 " ><br />
									<p><?= __('Forgot your password?') ?> <a class="main-link" href="{{ URL::route('password.email') }}"><?= __('Click here to reset') ?></a></p>
								</div>
							</div>
			
						</div>
						</div>
						</div>

					</div>



				</div>

				<div class="col-lg-6">
					<div class="row">
						<div class="col-lg-11 pull-right">
							<div class="panel panel-default">
  <div class="panel-body">
							<h2><?= __('Register') ?></h2>
							<p><?= __('By creating an account you\'ll have access to a dashboard where you can post ads, manage your ads and edit your ads.') ?></p><br />
							<a href="{{{ route_lang('auth/register') }}}" class="btn btn-primary"><?= __('Create an account') ?></a>
						</div>	 		
						</div>	 		
						</div>	 		
					</div>	 		
				</div>	 		
				
			</div>
			
		</div>
					<br />
			<br />
		
	</div>


@endsection
