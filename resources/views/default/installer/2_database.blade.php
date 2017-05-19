@extends('installer.default')

{{-- Content --}}

@section('content')
<p class="text-center text-muted" style="display: none">Please enter your database connection details below. If you're not sure, please contact your host.</p>
<h3 class="text-center">Step 2 - Database settings</h3>
<p class="text-center text-muted" style="display: none">Please enter your database connection details below. If you're not sure, please contact your host.</p>

<br />
@if($errors->has())
<div class="row">
<div class="col-sm-10 col-sm-offset-1">
<div class="alert alert-danger" role="alert">
	<strong>We encountered the following errors</strong><br />
<ul>
	@foreach($errors->all() as $message)
	<li>{{ $message }}</li>
	@endforeach
	<? if(Session::has('installation.database.error')) : ?>
	<li><?= Session::get('installation.database.error') ?></li>
	<? endif; ?>
</ul>
</div>
</div>
</div>

@endif
<br />
{!! Form::open(array('url' => url('installer/database'), 'class'=>'form-horizontal')) !!}

  <div class="form-group">
    <label for="inputEmail3" class="col-sm-3 control-label pull-left">Database name</label>
    <div class="col-sm-9">
	<?=  Form::text('database_name', null, ['placeholder' => '', 'class' => 'form-control']); ?>
	  <span id="helpBlock" class="help-block">Note: The database must have already been created.</span>

    </div>
  </div>
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label text-left">Username</label>
    <div class="col-sm-9">
	<?=  Form::text('database_username', null, ['placeholder' => 'Your MySQL username', 'class' => 'form-control']); ?>

    </div>
  </div>  
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Password</label>
    <div class="col-sm-9">
	  <?=  Form::text('database_password', null, ['placeholder' => 'Your MySQL password', 'class' => 'form-control']); ?>
    </div>
  </div> 
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Database host</label>
    <div class="col-sm-9">
      <?=  Form::text('database_host', null, ['placeholder' => 'Your database host.', 'class' => 'form-control']); ?>
    </div>
  </div>  
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Database port</label>
    <div class="col-sm-9">
		<div class="row">
			 <div class="col-sm-6">
      <?=  Form::text('database_port', 3306, ['placeholder' => 'Your database port.', 'class' => 'form-control']); ?>
	  </div>			 
			 <div class="col-sm-6">
	  		<p class="form-control-static"><em>Usually port 3306</em></p>

	  </div>
	  </div>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-3 col-sm-9">
      <button type="submit" class="btn btn-default">Continue&nbsp;&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></button>
    </div>
  </div>
<?= Form::close() ?>

	
@stop
