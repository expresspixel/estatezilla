@extends('installer.default')

{{-- Content --}}

@section('content')
<div class="row">
<div class="col-sm-10 col-sm-offset-1">
<h3 class="text-center">Step 1 - Your site &amp; login details</h3>
<p class="text-center text-muted">Welcome to the estatezilla installation process. Please browse the documentation and fill in the information below to get started.</p>
<br />
</div>
</div>

@if($errors->has())
<div class="row">
<div class="col-sm-10 col-sm-offset-1">
<div class="alert alert-danger" role="alert">
	<strong>We encountered the following errors:</strong><br />
<ul>
	@foreach($errors->all() as $message)
	<li>{{ $message }}</li>
	@endforeach
</ul>
</div>
</div>
</div>

@endif
<br />
{!! Form::open(array('url' => url('installer'), 'class'=>'form-horizontal')) !!}
  <div class="form-group">
    <label for="inputEmail3" class="col-sm-3 control-label pull-left">Site title</label>
    <div class="col-sm-9">
  		<?=  Form::text('site_title', null, ['placeholder' => '', 'class' => 'form-control']); ?>
    </div>
  </div>
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label text-left">Username</label>
    <div class="col-sm-9">
		<?=  Form::text('username', 'admin', ['placeholder' => '', 'class' => 'form-control']); ?>
      <?/*<input type="password" class="form-control" placeholder="Must contain alphanumeric characters only">*/?>

    </div>
  </div>  
  <br />
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Password</label>
    <div class="col-sm-9">
		<?=  Form::password('password', ['placeholder' => '', 'class' => 'form-control']); ?><br />
		<?=  Form::password('password_confirmation', ['placeholder' => '', 'class' => 'form-control']); ?>
    </div>
  </div> 
  <br />
  <div class="form-group">
    <label for="inputPassword3" class="col-sm-3 control-label">Your E-mail</label>
    <div class="col-sm-9">
		<?=  Form::text('email', null, ['placeholder' => '', 'class' => 'form-control']); ?>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-3 col-sm-9">
      <button type="submit" class="btn btn-default">Continue&nbsp;&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></button>
    </div>
  </div>
<?= Form::close() ?>
	
@stop
